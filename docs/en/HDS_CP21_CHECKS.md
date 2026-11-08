# HDS and Publisher CP21 checks

- `npm run check`: local source and regression checks, not release approval.
- `npm run hds:baseline`: HDS 1.2.1 baseline audit (requires `HDS_CHECKER`).
- `npm run hds:release`: strict HDS 1.2.1 release gate.
- Publisher CP21: signing, certificates and publishing workflow, must be run independently.

Historical CP19 is not the current release approval standard.
