import React from "react";

export default class About extends React.Component<any, {}> {

    constructor(props: any) {
        super(props);
    }

    componentDidMount() { }
    componentWillUnmount() { }

    render() {
        return (
            <div className="center">
                <div style={{ width: "70%" }}>
                    <h1>About</h1 >
                    <p>
                        Deviant Proxy is a simple encrypted proxy that handles a blacklist file.
                    </p>
                    <p>
                        The blacklist file should contain one domain name per line. For example :<br />
                        s4.hit.stat24.com<br />
                        apps.conduit-banners.com<br />
                        nonevasions.xyz<br />
                        www.ujecie-sprawdz.eu<br />
                        adsroller.com<br />
                        www.m4.moonshoe.live<br />
                    </p>
                    <p>
                        The overlay encryption process initially sends a packet with a generated public asymmetric key. Then, the server responds
                        with an encrypted symmetric key, which is decrypted using the private asymmetric key.
                    </p>
                    <p>
                        After this exchange, all traffic will be encrypted (or overlay-encrypted in the case of HTTPS connections) between your machine
                        and the proxy, including the connection and HTTP traffic. We strongly advise you to use a secure DNS (HTTPS DNS), such as Cloudflare.
                        It can easily be configured in your browser's DNS settings.
                    </p>
                    <p>
                        Enjoy your privacy!
                    </p>
                    <p>
                        ©Deviant Team
                    </p>
                </div>
            </div>
        );
    }
}

