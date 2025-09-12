# YearAway Scripts

This directory contains utility scripts for the YearAway project.

## Pre-commit Hook Setup

### `setup-pre-commit.sh`

Sets up a Git pre-commit hook that automatically validates YAML files before allowing commits.

**Usage:**
```bash
./scripts/setup-pre-commit.sh
```

**What it does:**
- Creates a pre-commit hook in `.git/hooks/pre-commit`
- The hook runs `and-now/content/bin/validate-yaml.py` before each commit
- Prevents commits with invalid YAML files
- Shows clear error messages for validation failures

**Benefits:**
- Prevents broken YAML from entering the repository
- Catches validation issues early
- Maintains data integrity across all YAML files
- Provides immediate feedback on problems

**Bypassing the hook:**
If you need to bypass validation (not recommended):
```bash
git commit --no-verify
```

**Removing the hook:**
```bash
rm .git/hooks/pre-commit
```

## Team Setup

Each team member should run the setup script after cloning the repository:

```bash
git clone <repository-url>
cd YearAway
./scripts/setup-pre-commit.sh
```

This ensures everyone has the same pre-commit validation in place.
