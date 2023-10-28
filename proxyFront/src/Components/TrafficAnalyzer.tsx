import React from "react";

export default class TrafficAnalyzer extends React.Component<any, { proxyData: string[]; }> {

    constructor(props: any) {
        super(props);
        this.state = {
            proxyData: []
        };


    }

    componentDidMount() {

        window.proxy.trafficAnalyzerHistory().then(data => {
            this.setState({
                proxyData: data
            })
        }).then(() => {
            window.api.receive("proxyData", (data: string) => {
                console.log('Data received from proxy:', data);
                this.state.proxyData.unshift(data);
                this.setState({
                    proxyData: this.state.proxyData
                })
            });
        });
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <div className="center">
                <h1>Taffic analyser</h1 >
                <div id="roll">
                    {this.state.proxyData.map((data, index) => (
                        <div key={index} style={{ whiteSpace: 'pre-line' }}>{data}</div> // Rendering each item in proxyData array
                    ))}
                </div>
            </div>
        );
    }
}

