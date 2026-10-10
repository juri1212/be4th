---
title: How to play audio on two AirPods (or any two outputs) on a Mac
description: macOS plays sound on one output at a time. Here's how to listen with two pairs of AirPods, or headphones and speakers together, using Audio MIDI Setup or the free Duophonic app.
summary: The built-in way with Audio MIDI Setup, and the one-switch way with Duophonic.
date: "2026-10-05"
tags: [macOS, Core Audio, Guide]
project: duophonic
image: /images/duophonic/og-image.jpg
---

Two people, one laptop, one film. On an iPhone you'd tap *Share Audio* and both pairs of AirPods would play. On a Mac, the sound menu lets you pick exactly one output. Choose your AirPods and the speakers go quiet; choose your friend's and yours do.

macOS can play to several devices at once. The feature is just hidden in a utility most people never open. This guide shows the built-in way first, then the faster way with [Duophonic](/projects/duophonic/), a small free menu bar app I wrote to make it one switch.

<div class="summary"><strong>Short version</strong><ol><li>Connect both outputs to your Mac (for AirPods: pair both in Bluetooth settings).</li><li>Install <a href="/projects/duophonic/">Duophonic</a> and click its icon in the menu bar.</li><li>Pick Output 1 and Output 2.</li><li>Turn on <strong>Audio Sharing</strong>. Sound now plays on both, in sync.</li></ol></div>

## Works for more than AirPods

Anything that shows up as a sound output can be combined: AirPods, Beats or other Bluetooth headphones, the built-in speakers, USB headsets and DACs, and monitors over HDMI or DisplayPort. A few setups people use it for:

- Two people watching the same film with their own headphones, on a plane or a train.
- Headphones on for you, the room speakers on for everyone else at a party.
- Demoing on a big screen while monitoring the sound in your own headphones.

## The built-in way: a Multi-Output Device in Audio MIDI Setup

macOS ships a utility called **Audio MIDI Setup** that can combine outputs into a *Multi-Output Device*. It works, but it takes a few steps each time you set it up:

1. Open **Audio MIDI Setup** (in *Applications → Utilities*, or search for it with Spotlight, <kbd>⌘</kbd> <kbd>Space</kbd>).
2. Click the **+** button in the bottom-left corner and choose **Create Multi-Output Device**.
3. Tick **Use** next to both outputs you want to play on.
4. Choose the **Primary Device**. It sets the timing that the other output follows.
5. Tick **Drift Correction** for the other output, so it doesn't slowly fall out of sync.
6. Control-click the new Multi-Output Device in the sidebar and choose **Use This Device For Sound Output**.

A few things make this awkward to live with:

- **No volume control.** macOS can't change the volume of a Multi-Output Device, so the volume keys and the slider in Control Center stop working. You have to go back into Audio MIDI Setup to change each device's level.
- **You switch back by hand.** When you're done, you have to pick your normal output again. Alert sounds may also stay on the old device.
- **It sticks around.** The Multi-Output Device stays in your list of outputs until you delete it in Audio MIDI Setup.

## The one-switch way: Duophonic

Duophonic creates the same kind of multi-output device for you, with Core Audio, and handles the parts above: a volume slider per device, drift correction already on, switching outputs while it plays, and putting everything back when you stop.

<figure><img src="/images/duophonic/menu-sharing.webp" width="768" height="922" alt="Duophonic menu bar window with Audio Sharing on, playing on MacBook Pro Speakers and AirPods Pro, In Sync" /><figcaption>Sharing to the built-in speakers and a pair of AirPods. Each output has its own volume.</figcaption></figure>

### 1. Install Duophonic

1. [Download Duophonic.zip](https://github.com/juri1212/Duophonic/releases/latest/download/Duophonic.zip) (the latest release from GitHub). It needs macOS 26.1 or later.
2. Double-click the zip to unpack it, then drag **Duophonic** into your Applications folder.
3. Open it from Applications.

If macOS says it can't verify the app, open **System Settings → Privacy &amp; Security**, scroll down to the message about Duophonic and click **Open Anyway**. You only need to do this once.

Prefer the Terminal? This downloads, installs and opens it in one go:

```sh
curl -sSLO https://github.com/juri1212/Duophonic/releases/latest/download/Duophonic.zip && \
unzip -q Duophonic.zip && rm -f Duophonic.zip && \
mv Duophonic.app /Applications/ && open /Applications/Duophonic.app
```

Duophonic has no Dock icon and no window. Look for its icon (a cable splitting in two) in the menu bar at the top of the screen.

### 2. Connect both outputs

Duophonic plays on devices that are already connected to your Mac. For wired speakers or a monitor, plug them in. For AirPods or other Bluetooth headphones:

1. Open **System Settings → Bluetooth**.
2. Your own AirPods usually show up already. Click **Connect**.
3. For the second pair, put the AirPods in pairing mode. On most models: put them in their case, open the lid and hold the button on the back until the light flashes white. When they appear in the list, click **Connect**.

New devices show up in Duophonic as soon as they connect. There's nothing to refresh.

### 3. Pick your two outputs

Click the Duophonic icon in the menu bar. Click **Output 1** or **Output 2** to choose a device from the list. The first time you open it, Duophonic preselects your current output and a pair of headphones if it finds one, and it remembers your choice from then on.

<figure><img src="/images/duophonic/menu-off.webp" width="768" height="922" alt="Duophonic menu bar window before sharing, showing Output 1 and Output 2 and the Audio Sharing switch turned off" /><figcaption>Before sharing: two outputs chosen, the switch still off.</figcaption></figure>

Output 1 is the *clock source* that sets the timing. Output 2 is drift corrected to follow it. If you pick the device that's already in the other slot, the two swap.

### 4. Turn on Audio Sharing

Flip the **Audio Sharing** switch at the top. The label changes to *Playing on both outputs* and the badge between the two devices shows *In Sync*. Everything your Mac plays (music, video, games) now goes to both.

You can change either output while it's playing. The music keeps going.

### 5. Set the volume

Use the slider under each device to set its volume, so one person can listen louder than the other. Like with Audio MIDI Setup, the volume keys don't work while sharing, because macOS can't change the volume of a combined device. If a slider is grayed out, that device doesn't let apps change its volume. Use the buttons on the device itself instead.

### 6. Stop sharing

Turn the switch off, quit Duophonic, or just pick another output in Control Center. Duophonic restores the output you had before (for sound and for alerts) and removes the temporary device it created.

To have it ready all the time, turn on **Open at Login** in the same menu.

## Tips for good sync

- **Similar devices sync best.** Drift correction stops two outputs from wandering apart over time, but it can't remove the delay that Bluetooth itself adds. Two pairs of AirPods stay closely together. Bluetooth headphones next to wired speakers can sound slightly behind, which you'll notice most if you can hear both at once.
- **Avoid using a headset's microphone.** When a Bluetooth headset's mic is in use, for example during a call, macOS switches it into a lower-quality mode for both listening and talking.
- **Use Output 1 for the device that matters most.** It's the clock source, so it plays without any resampling.

## FAQ

### Can I connect two pairs of AirPods to one Mac?

Yes. A Mac can be connected to several Bluetooth audio devices at the same time, but it plays to only one of them unless you combine them into a multi-output device, either in Audio MIDI Setup or with Duophonic.

### Does the Mac have a Share Audio feature like the iPhone?

Not in the sound menu. The closest built-in option is the Multi-Output Device in Audio MIDI Setup described above. Duophonic is a shortcut for setting one up and managing it.

### Can I play to more than two outputs?

Duophonic is made for two, hence the name. Audio MIDI Setup lets you tick as many devices as you like in a Multi-Output Device.

### Is Duophonic free? Does it collect data?

It's free and open source under the MIT license. It runs in the macOS app sandbox without network access, so it can't send anything anywhere. You can read every line of the [source on GitHub](https://github.com/juri1212/Duophonic).

### What if Duophonic quits unexpectedly?

The next time you open it, Duophonic either picks up where it left off or removes the leftover device and restores your output. You can also delete the device by hand in Audio MIDI Setup.

### How do I uninstall it?

Quit Duophonic, then drag it from Applications to the Trash. To remove its settings too, run:

```sh
rm -rf ~/Library/Containers/com.juri1212.Duophonic
```

## Try it

<p><a class="button" href="https://github.com/juri1212/Duophonic/releases/latest/download/Duophonic.zip">Download Duophonic</a></p>

Found a bug or have an idea? [Open an issue on GitHub](https://github.com/juri1212/Duophonic/issues).
