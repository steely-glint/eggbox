# Eggbox
Echo cancelling local audio by feeding it through back to back webRTC peer connections

Goal here is to be able to play music locally whilst on a video call and have the remote user not hear the music, but be able to continue the conversation.

##Diagram

                                           MP3
                                           Music
                                     +------------------+     +--------------+
                                     |                  |     |              |
     Music      <--------------------+ Eggbox           +----->  Echo        |
                    Local            +------------------+     |  Canceller   +----->Internet--------->Remote  ---------->speech only
                    Listener                                  |              |                        Listener
                                     +------------------+     |              |
                +-------------------->                  +----->              |
    Speech      <--------------------+ Rendezvous app   <-----+              |
                                     +------------------+     +--------------+

Eggbox requires 2 audio tags in the hosting page
1) to supply the audio (eg an mp3)
2) the second to play the audio locally

These 2 are joined by a pair of back to back Peerconnections, in an effort to trick the
WebRTC echo canceller in to thinking that the music is from a remote source and should be cancelled on any outbound webrtc calls.

#Test
To evaluate this we integrated Eggbox into an opensource video call app (https://github.com/pipe/two)
on a branch (`withmusic`) and put the results on a test server.

To create a test call:
1) visit the test site
2) accept mic and camera permission requests
3) send the new URL to a remote user
4) remote user accepts the call and permisson requests
5) local user clicks play on _both_ audio controls
6) note results

#Evaluation
tldr; - Partial success - results depend on the hardware.

| local hw | remote hw | local result | remote result | useful? |
|----------|-----------|--------------|---------------|---------|
| iphone   | macbook   | music+speech | speech        | yes     |
| macmini  | macbook   | music+speech | music+speech  | no      |
| windows  | android   | music+speech | music+speech  | no      |
| android  | windows   | music+speech | speech        | yes     |
|          |           |              |               |         |

It seems like mobile echo cancellers work, but laptop ones don't.

