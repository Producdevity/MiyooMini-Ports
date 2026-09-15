import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = resolve(".github/scripts/sync-readme.sh");
let root: string;
let remote: string;
let checkout: string;
let artifact: string;
let sha: string;

// Keep user-level git config (gpgsign, includeIf, ...) out of the fixtures.
const HERMETIC_GIT_ENV = {
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "true",
} as const;

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...HERMETIC_GIT_ENV },
  }).trim();
}

function sync(env: NodeJS.ProcessEnv = {}) {
  return spawnSync("bash", [script, artifact], {
    cwd: checkout,
    env: { ...process.env, ...HERMETIC_GIT_ENV, GITHUB_SHA: sha, ...env },
    encoding: "utf8",
  });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "readme-sync-"));
  remote = join(root, "remote.git");
  checkout = join(root, "checkout");
  artifact = join(root, "README.md");
  git(root, "init", "--bare", remote);
  git(root, "init", "-b", "master", checkout);
  git(checkout, "config", "user.name", "Test");
  git(checkout, "config", "user.email", "test@example.com");
  git(checkout, "config", "core.hooksPath", "/dev/null");
  writeFileSync(join(checkout, "README.md"), "Old table\n");
  writeFileSync(join(checkout, "ports.json"), "{}\n");
  git(checkout, "add", ".");
  git(checkout, "commit", "-m", "Initial data");
  git(checkout, "remote", "add", "origin", remote);
  git(checkout, "push", "origin", "master");
  sha = git(checkout, "rev-parse", "HEAD");
  writeFileSync(artifact, "Generated table\n");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("README synchronization", () => {
  it("updates only README on top of the checked commit", () => {
    writeFileSync(join(checkout, "ports.json"), '{"unrelated":true}\n');
    git(checkout, "add", "ports.json");
    expect(sync().status).toBe(0);
    expect(git(remote, "show", "master:README.md")).toBe("Generated table");
    expect(git(remote, "show", "master:ports.json")).toBe("{}");
    expect(git(remote, "rev-parse", "master^")).toBe(sha);
    expect(git(remote, "diff", "--name-only", sha, "master")).toBe("README.md");
  });

  it("does not commit an unchanged README", () => {
    writeFileSync(artifact, readFileSync(join(checkout, "README.md")));
    expect(sync().status).toBe(0);
    expect(git(remote, "rev-parse", "master")).toBe(sha);
  });

  it("leaves newer master commits intact", () => {
    writeFileSync(join(checkout, "README.md"), "Newer edit\n");
    git(checkout, "commit", "-am", "Newer edit");
    git(checkout, "push", "origin", "master");
    const newer = git(remote, "rev-parse", "master");
    git(checkout, "checkout", "--detach", sha);
    expect(sync().status).toBe(0);
    expect(git(remote, "rev-parse", "master")).toBe(newer);
    expect(git(remote, "show", "master:README.md")).toBe("Newer edit");
  });

  it("fails visibly when the remote rejects writes", () => {
    writeFileSync(join(remote, "hooks", "pre-receive"), "#!/bin/sh\nexit 1\n", {
      mode: 0o755,
    });
    const result = sync();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Check branch permissions");
    expect(git(remote, "rev-parse", "master")).toBe(sha);
  });

  it("does not overwrite a commit arriving just before the push", () => {
    writeFileSync(join(checkout, "README.md"), "Concurrent edit\n");
    git(checkout, "commit", "-am", "Concurrent edit");
    const newer = git(checkout, "rev-parse", "HEAD");
    git(checkout, "push", "origin", "HEAD:refs/heads/concurrent");
    git(checkout, "checkout", "--detach", sha);
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    const wrapper = mkdtempSync(join(root, "bin-"));
    writeFileSync(
      join(wrapper, "git"),
      '#!/bin/sh\ncase " $* " in\n*" push "*) "$REAL_GIT" --git-dir="$REMOTE" update-ref refs/heads/master "$NEWER" ;;\nesac\nexec "$REAL_GIT" "$@"\n',
      { mode: 0o755 },
    );
    const result = sync({
      PATH: `${wrapper}:${process.env.PATH}`,
      REAL_GIT: realGit,
      REMOTE: remote,
      NEWER: newer,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Master advanced during synchronization");
    expect(git(remote, "rev-parse", "master")).toBe(newer);
    expect(git(remote, "show", "master:README.md")).toBe("Concurrent edit");
  });

  it("refuses a checkout that differs from the checked commit", () => {
    sha = "0".repeat(40);
    expect(sync().status).not.toBe(0);
    expect(git(remote, "show", "master:README.md")).toBe("Old table");
  });

  it("fails when the remote cannot be read", () => {
    git(checkout, "remote", "set-url", "origin", join(root, "missing.git"));
    expect(sync().status).not.toBe(0);
    expect(git(checkout, "rev-parse", "HEAD")).toBe(sha);
  });
});
