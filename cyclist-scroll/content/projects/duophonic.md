---
title: Duophonic
order: 1
kind: macOS app
year: 2025–26
tagline: Play your Mac’s audio on two outputs at once.
summary: A menu bar app that sends sound to two devices together — two pairs of AirPods, headphones and speakers, or any two outputs — and keeps them in sync.
stack: [Swift, SwiftUI, Core Audio, XCTest]
highlights:
  - Builds a Core Audio multi-output device with drift compensation on the second output
  - Switches either output while playing by updating the device in place
  - Restores your previous outputs on quit, and cleans up after a crash on the next launch
image: /images/duophonic/menu-sharing.webp
imageAlt: Duophonic’s menu bar window sharing audio between MacBook Pro Speakers and AirPods Pro
icon: /images/duophonic/icon-256.png
links:
  download: https://github.com/juri1212/Duophonic/releases/latest/download/Duophonic.zip
  source: https://github.com/juri1212/Duophonic
post: play-mac-audio-on-two-outputs
---

## The problem

On an iPhone you tap *Share Audio* and two pairs of AirPods play the same film. On a Mac, the sound menu lets you pick exactly one output. macOS *can* play to several devices at once — through a Multi-Output Device in Audio MIDI Setup — but it takes six steps, breaks the volume keys and stays in your output list until you delete it by hand.

Duophonic turns that into one switch in the menu bar.

## How it works

When you turn on **Audio Sharing**, Duophonic creates a private aggregate device through Core Audio, with your two outputs as sub-devices:

- **Output 1 is the clock source.** It plays without resampling and sets the timing.
- **Output 2 is drift compensated,** so the two don't wander apart during a long film.
- **The aggregate becomes the default output** for sound and for alerts. The outputs it replaced are persisted first, so they can be restored even if the app is killed.

Switching either output while sharing updates the aggregate's sub-device list in place, so playback never stops. Picking the device that's already in the other slot swaps the two.

## Following the hardware

Audio devices come and go: AirPods go back into their case, a monitor gets unplugged, someone picks a different output in Control Center. Duophonic observes Core Audio's hardware properties and reacts to each case:

- If macOS already moved to another output, it reflects that and turns sharing off.
- If you picked another output yourself, it respects that choice and removes its device.
- If a selected device reconnects, it rejoins playback, with drift compensation re-applied.

On launch it looks for aggregates left behind by a crash. One that's still in use is adopted, any other is removed. Only devices with Duophonic's own UID format are touched, so aggregates created by other apps are never destroyed.

## Built to be tested

Core Audio is a C API full of global state, which makes it hard to test against. All hardware access goes through a small `AudioHardware` protocol with two implementations: one backed by Core Audio, and an in-memory one that the tests drive. The lifecycle — enabling, swapping, disconnects, crash recovery, restoring defaults — is covered by unit tests that never touch a real device.

```swift
protocol AudioHardware: AnyObject {
    func outputDevices() -> [AudioDevice]
    func defaultDeviceUID(_ kind: DefaultDeviceKind) -> String?
    func setDefaultDevice(_ kind: DefaultDeviceKind, uid: String) throws
    func createAggregate(_ configuration: AggregateConfiguration) throws
    func updateAggregate(uid: String, mainUID: String, secondaryUID: String) throws
    func destroyAggregate(uid: String) throws
    func startObserving(_ handler: @escaping () -> Void)
}
```

## Small and private

Duophonic is a sandboxed menu bar app with no account, no tracking and no network access. It's free and open source under the MIT license, and ships as a zip from GitHub Releases.

<figure><img src="/images/duophonic/menu-off.webp" width="768" height="922" alt="Duophonic menu bar window before sharing, showing Output 1 and Output 2 and the Audio Sharing switch turned off" loading="lazy" /><figcaption>Before sharing: two outputs chosen, the switch still off.</figcaption></figure>
