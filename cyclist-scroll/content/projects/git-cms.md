---
title: git-cms
order: 2
kind: Backend service
year: 2026
tagline: A CMS where every edit is a pull request.
summary: A Rust backend that lets people edit a repository’s content in the browser. Each editing session becomes a draft pull request, committed with the editor’s own GitHub identity.
stack: [Rust, axum, Tokio, GitHub Apps, JWT, Vite]
highlights:
  - One draft pull request per editing session, so every change goes through review
  - Commits are pushed with the signed-in user’s GitHub App token, not a shared bot
  - GitHub credentials live only in process memory — nothing is written to disk
links:
  source: https://github.com/juri1212/git-cms
---

## The idea

Static sites keep their content in Git, which is great for developers and awkward for everyone else. git-cms puts a small editing API in front of a repository: people sign in with GitHub, edit content in the browser, and the changes arrive as a regular pull request that can be reviewed, previewed and merged like any other.

## How it works

- **Allowlisted content.** The server only exposes UTF-8 files that match the configured globs, so the editor can't reach code or secrets in the same repository.
- **Sessions are pull requests.** The first save in a session creates a branch and a draft pull request. Later saves become commits on that branch.
- **Your identity, not a bot's.** Sign-in uses a GitHub App's user authorization, so commits and pull requests are attributed to the person who made them, and GitHub's own permissions decide who can write.
- **Short-lived credentials.** The GitHub user token is held in memory only. The browser gets a CMS-specific JWT and sends it as a bearer token to `/api/*`. After a restart, people simply sign in again.

## Stack

The service is written in Rust on axum and Tokio, with `reqwest` for the GitHub API and `tower-http` for tracing, request IDs and CORS. In the tests, the GitHub API is mocked with `wiremock`, so they run without network access or real credentials.

A small Vite frontend shows the client side: it handles the sign-in callback, keeps the CMS token, and opens a session automatically on the first save.
