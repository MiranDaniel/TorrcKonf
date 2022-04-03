var app = document.getElementById('loader'); // loader in button

var type_ = null; // type of node (bridge, relay, exit)
var output_ = "";


class Konf {
    constructor() {
        this.bridgeRelay = null;
        this.exitRelay = null;

        this.orPort = null;
        this.dirPort = null;

        this.name = null;
        this.contact = null;

        this.ipvsix = null;
        this.socksPort = null;

        this.conf = Array();
    }
    setType(t_) {
        if (t_ === "choice-bridge") {
            this.bridgeRelay = 1;
        } else if (t_ === "choice-relay") {
            null // no setting needed
        } else if (t_ === "choice-exit") {
            this.exitRelay = 1;
        }
    }
    setPorts(or_, dir_) {
        this.orPort = or_;
        this.dirPort = dir_;
    }
    setName(name_){
        if(name_ === null){
            this.name = "Unnamed"
        } else{
            this.name = name_;
        }
    }
    setContact(con_){
        this.contact = con_;
    }
    setIpvsix(addy_){
        this.ipvsix = addy_;
    }
    setSocks(port_){
        this.socksPort = 0; // optional socks will be implemented later
    }


    preDump() {
        this.conf.push(`ORPort ${this.orPort}`)
        if(this.ipvsix !== null){
            this.conf.push(`ORPort [${this.ipvsix}]${this.orPort}`)
        }
        this.conf.push(`DirPort ${this.dirPort}`)
        this.conf.push(`Nickname ${this.name}`)
        this.conf.push(`ContactInfo ${this.contact}`)

        this.conf.push(`SocksPort ${this.socksPort}`)

        if (this.bridgeRelay !== null) {
            this.conf.push(`BridgeRelay ${this.bridgeRelay}`)
        }
        if (this.exitRelay !== null) {
            this.conf.push(`ExitRelay ${this.exitRelay}`)
            if(this.ipvsix !== null){
                this.conf.push(`IPv6Exit 1`)
            }
        }
        return this.conf
    }

    dump() {
        this.preDump();
        console.log(this.conf);
        return this.conf.join("\n")
    }

}
function typeChoice(choice) { // handler for type picker
    if (choice === type_) {
        return;
    } else if (type_ === null) {
        document.getElementById(choice).classList.add("clicked");
        type_ = choice;
    } else {
        document.getElementById(type_).classList.remove("clicked");
        document.getElementById(choice).classList.add("clicked");
        type_ = choice;
    }
}
function generate() { // trigger on generate button click
    var typewriter = new Typewriter(app, {
        loop: false,
        cursor: "<strong>|</strong>"
    });
    var t = typewriter.typeString('Loading...')
        .pauseFor(1000)
        .deleteChars(3)
        .pauseFor(1000)
        .typeString('...')
        .pauseFor(1000)
        .deleteChars(3)
        .pauseFor(2500)
        .typeString('...')
        .pauseFor(2500)
        .deleteChars(3)
        .pauseFor(5000)
        .typeString('...')
        .pauseFor(5000)
        .deleteAll()
        .typeString('Looks like something broke, please try again.')
        .start();


    const k_ = new Konf();
    k_.setType(type_);
    k_.setPorts(
        document.getElementById("input-relay-orport").value,
        document.getElementById("input-relay-dirport").value
    )
    k_.setName(
        document.getElementById("input-relay-name").value
    )
    k_.setContact(
        document.getElementById("input-relay-contact").value
    )
    k_.setIpvsix(
        document.getElementById("input-relay-ipvsix").value
    )
    k_.setSocks(
        null // TODO
    )

    output_ = k_.dump()

    delete typewriter;
    t.stop()
    document.getElementById("loader").innerText = "Successfully generated!"
    document.getElementById("output").innerText = output_;

}



