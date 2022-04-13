/**
 * Created by tim on 13/04/2022.
 */
class Eggbox {
    constructor(mediaElement) {
        this.mediaElement =mediaElement;
        this.peerConnectionOfferAnswerCriteria =  {offerToReceiveAudio: true, offerToReceiveVideo: false };
        this.configuration = {
            "iceServers": [
                {"urls": "stun:stun4.l.google.com:19302"}
            ],
            "bundlePolicy": "max-bundle", "iceCandidatePoolSize": 0
        };
        this.startCall = () => {
            this.ac = new AudioContext();
            if (!this.mediaElement) {
                console.log("no audio on that element");
            } else {
                var meTrack = this.ac.createMediaElementSource(this.mediaElement);
                this.source = this.ac.createMediaStreamDestination();
                meTrack.connect(this.source);
            }
            this.pc1 = new RTCPeerConnection(this.configuration, null);
            this.pc2 = new RTCPeerConnection(this.configuration, null);
            this.pc1.onicecandidate = (e) => {
                console.log("pc1 local ice candidate", e.candidate);
                if (e.candidate != null) {
                    var nc = new RTCIceCandidate(e.candidate);
                    this.pc2.addIceCandidate(nc)
                }
            };
            this.pc2.onicecandidate = (e) => {
                console.log("pc2 local ice candidate", e.candidate);
                if (e.candidate != null) {
                    var nc = new RTCIceCandidate(e.candidate);
                    this.pc1.addIceCandidate(nc)
                }
            };
            this.pc1.onnegotiationneeded =  () => {
                this.pc1.createOffer().then( (offer) => {
                    this.pc1.setLocalDescription(offer)
                        .then(() => {
                            console.log("pc1 set Local description  ok");
                            this.pc2.setRemoteDescription(offer).then(() => {
                                console.log("pc2 set Remote description  ok");
                                return this.pc2.createAnswer()
                            })
                            .then((answer) => {
                                console.log("pc2 Create answer ok");
                                this.pc2.setLocalDescription(answer);
                                console.log("pc2 set localDesctiption ok");
                                return this.pc1.setRemoteDescription(answer);
                            }).then( () => {console.log("pc1 set RemoteDesctiption ok");})
                    })
                }).catch(function (error) {
                    console.log("Onn Error "+error);
                });
            };
            this.pc2.ontrack = (event) => {
                console.log("got remote track ", event.track.kind);
            };
            this.pc1.oniceconnectionstatechange = (e) => {
                console.log("ice state is changed" + this.pc1.iceConnectionState);
                if (this.pc1.iceConnectionState === "connected"){
                    console.log(this.pc1.getTransceivers());
                    var send = this.pc1.getTransceivers().find( (tr) => tr.sender && tr.sender.track.kind==="audio").sender;
                    console.log(send);
                    //tweakL16(send);
                }
                /*
                 "new"	The ICE agent is gathering addresses or is waiting to be given remote candidates through calls to RTCPeerConnection.addIceCandidate() (or both).
                 "checking"	The ICE agent has been given one or more remote candidates and is checking pairs of local and remote candidates against one another to try to find a compatible match, but has not yet found a pair which will allow the peer connection to be made. It's possible that gathering of candidates is also still underway.
                 "connected"	A usable pairing of local and remote candidates has been found for all components of the connection, and the connection has been established. It's possible that gathering is still underway, and it's also possible that the ICE agent is still checking candidates against one another looking for a better connection to use.
                 "completed"	The ICE agent has finished gathering candidates, has checked all pairs against one another, and has found a connection for all components.
                 "failed"	The ICE candidate has checked all candidates pairs against one another and has failed to find compatible matches for all components of the connection. It is, however, possible that the ICE agent did find compatible connections for some components.
                 "disconnected"	Checks to ensure that components are still connected failed for at least one component of the RTCPeerConnection. This is a less stringent test than "failed" and may trigger intermittently and resolve just as spontaneously on less reliable networks, or during temporary disconnections. When the problem resolves, the connection may return to the "connected" state.
                 "closed"
                 */
                if (this.pc1.iceConnectionState === "failed") {
                    console.log("ice failed");
                }
                if (this.pc1.iceConnectionState === "disconnected") {
                    console.log("ice disconnected");
                }
            };
            if (this.source){
                var pstream = this.source.stream;
                pstream.getTracks().forEach(track => {
                    if (track.kind === "audio") {
                        this.pc1.addTrack(track);
                    }
                    //if (track.kind === "audio") {
                    //    flipCodecOrder(pc, track);
                    //}
                    console.log("added local track "+ track.id+ " "+ track.kind);
                });
            }
        }
    }
}