var exitPolicy = `
ExitPolicy accept *:20-23     # FTP, SSH, telnet
ExitPolicy accept *:43        # WHOIS
ExitPolicy accept *:53        # DNS
ExitPolicy accept *:79-81     # finger, HTTP
ExitPolicy accept *:88        # kerberos
ExitPolicy accept *:110       # POP3
ExitPolicy accept *:143       # IMAP
ExitPolicy accept *:194       # IRC
ExitPolicy accept *:220       # IMAP3
ExitPolicy accept *:389       # LDAP
ExitPolicy accept *:443       # HTTPS
ExitPolicy accept *:464       # kpasswd
ExitPolicy accept *:465       # URD for SSM (more often: an alternative SUBMISSION port, see 587)
ExitPolicy accept *:531       # IRC/AIM
ExitPolicy accept *:543-544   # Kerberos
ExitPolicy accept *:554       # RTSP
ExitPolicy accept *:563       # NNTP over SSL
ExitPolicy accept *:587       # SUBMISSION (authenticated clients [MUA's like Thunderbird] send mail over STARTTLS SMTP here)
ExitPolicy accept *:636       # LDAP over SSL
ExitPolicy accept *:706       # SILC
ExitPolicy accept *:749       # kerberos
ExitPolicy accept *:873       # rsync
ExitPolicy accept *:902-904   # VMware
ExitPolicy accept *:981       # Remote HTTPS management for firewall
ExitPolicy accept *:989-990   # FTP over SSL
ExitPolicy accept *:991       # Netnews Administration System
ExitPolicy accept *:992       # TELNETS
ExitPolicy accept *:993       # IMAP over SSL
ExitPolicy accept *:994       # IRCS
ExitPolicy accept *:995       # POP3 over SSL
ExitPolicy accept *:1194      # OpenVPN
ExitPolicy accept *:1220      # QT Server Admin
ExitPolicy accept *:1293      # PKT-KRB-IPSec
ExitPolicy accept *:1500      # VLSI License Manager
ExitPolicy accept *:1533      # Sametime
ExitPolicy accept *:1677      # GroupWise
ExitPolicy accept *:1723      # PPTP
ExitPolicy accept *:1755      # RTSP
ExitPolicy accept *:1863      # MSNP
ExitPolicy accept *:2082      # Infowave Mobility Server
ExitPolicy accept *:2083      # Secure Radius Service (radsec)
ExitPolicy accept *:2086-2087 # GNUnet, ELI
ExitPolicy accept *:2095-2096 # NBX
ExitPolicy accept *:2102-2104 # Zephyr
ExitPolicy accept *:3128      # SQUID
ExitPolicy accept *:3389      # MS WBT
ExitPolicy accept *:3690      # SVN
ExitPolicy accept *:4321      # RWHOIS
ExitPolicy accept *:4643      # Virtuozzo
ExitPolicy accept *:5050      # MMCC
ExitPolicy accept *:5190      # ICQ
ExitPolicy accept *:5222-5223 # XMPP, XMPP over SSL
ExitPolicy accept *:5228      # Android Market
ExitPolicy accept *:5900      # VNC
ExitPolicy accept *:6660-6669 # IRC
ExitPolicy accept *:6679      # IRC SSL
ExitPolicy accept *:6697      # IRC SSL
ExitPolicy accept *:8000      # iRDMI
ExitPolicy accept *:8008      # HTTP alternate
ExitPolicy accept *:8074      # Gadu-Gadu
ExitPolicy accept *:8080      # HTTP Proxies
ExitPolicy accept *:8082      # HTTPS Electrum Bitcoin port
ExitPolicy accept *:8087-8088 # Simplify Media SPP Protocol, Radan HTTP
ExitPolicy accept *:8332-8333 # Bitcoin
ExitPolicy accept *:8443      # PCsync HTTPS
ExitPolicy accept *:8888      # HTTP Proxies, NewsEDGE
ExitPolicy accept *:9418      # git
ExitPolicy accept *:9999      # distinct
ExitPolicy accept *:10000     # Network Data Management Protocol
ExitPolicy accept *:11371     # OpenPGP hkp (http keyserver protocol)
ExitPolicy accept *:19294     # Google Voice TCP
ExitPolicy accept *:19638     # Ensim control panel
ExitPolicy accept *:50002     # Electrum Bitcoin SSL
ExitPolicy accept *:64738     # Mumble
ExitPolicy reject *:*`

var app = document.getElementById('loader'); // loader in button

const regexIpvsix = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;


var type_ = null; // type of node (bridge, relay, exit)
var reduced_ = null;
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

        this.reduced = null;

        this.conf = Array();
        this.alerts = Array();
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
        if(or_ < 1025){
            this.alerts.push(["info","ORPort is under 1024, Tor will need root privileges to run!"])
        }
        if(dir_ < 1025){
            this.alerts.push(["info","DirPort is under 1024, Tor will need root privileges to run!"])
        }
        this.orPort = or_;
        this.dirPort = dir_;
    }
    setName(name_) {
        if (name_ !== "") {
            this.name = name_;
        } else {
            this.name = "Unnamed"
            this.alerts.push(["info","Relay nickname not set! Others will have to refer to your relay by it's key!"])
        }
    }
    setContact(con_) {
        if(con_ !== ""){
            this.contact = con_;
        } else{
            this.contact = "";
            this.alerts.push(["info","Contact information not set!"])
        }
    }
    setIpvsix(addy_) {
        if(addy_ !== ""){
            if(regexIpvsix.test(addy_) === true){
                alert(regexIpvsix.test(addy_))
                this.ipvsix = addy_;
            } else{
                this.ipvsix = addy_;
                this.alerts.push(["critical","Invalid IPv6! Relay will not run, even on IPv4!"])
            }
        } else{
            this.ipvsix = null;
        }
    }
    setSocks(port_) {
        this.socksPort = 0; // optional socks will be implemented later
    }
    setReduced(option_) {
        if (option_ === "input-reduced-on") {
            this.reduced = exitPolicy;
        } else {
            this.reduced = false;
        }
    }


    preDump() {
        this.conf.push(`ORPort ${this.orPort}`)
        if (this.ipvsix !== null) {
            this.conf.push(`ORPort [${this.ipvsix}]:auto`)
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
            if (this.ipvsix !== null) {
                this.conf.push(`IPv6Exit 1`)
            }
        }

        if (this.reduced !== false) {
            this.conf.push(this.reduced)
        }

        return this.conf
    }

    dump() {
        this.preDump();
        console.log(this.conf);
        return this.conf.join("\n")
    }
    info(){
        let dat = "";
        this.alerts.reverse()
        this.alerts.push(["primary",`<b>Compiled with ${this.alerts.length} warnings/errors!</b>`])
        this.alerts.reverse()
        for(let i=0; i<this.alerts.length; i++){
            let t = this.alerts[i];
            if(t[0] === "critical"){
                dat = dat+`<span class='alert-danger'><b>Critical</b> &mid; ${t[1]}</span>`+"\n"
            } else if(t[0] === "info"){
                dat = dat+`<span class='alert-info'><b>Info</b> &mid; ${t[1]}</span>`+"\n"
            } else if(t[0] === "primary"){
                dat = dat+`<span class='alert-primary'>${t[1]}</span><br>`+"\n"
            }
            
        }
        return dat
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
function reducedChoice(choice) {
    if (choice === reduced_) {
        return;
    } else if (reduced_ === null) {
        document.getElementById(choice).classList.add("clicked");
        reduced_ = choice;
    } else {
        document.getElementById(reduced_).classList.remove("clicked");
        document.getElementById(choice).classList.add("clicked");
        reduced_ = choice;
    }
}



function generate() { // trigger on generate button click
    var startTime = performance.now()
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
    k_.setType(
        type_
    );
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
    k_.setReduced(
        reduced_
    )

    output_ = k_.dump()
    info_ = k_.info()
    t.stop()


    var endTime = performance.now()
    document.getElementById("output").innerText = output_;
    document.getElementById("info").innerHTML = info_;
    document.getElementById("feedback").style.display = "unset";
    document.getElementById("loader").innerHTML = `Successfully generated <small>in ${endTime-startTime}ms</small>`

}
