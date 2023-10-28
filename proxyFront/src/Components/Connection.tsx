import React from "react";

export default class Connection extends React.Component<
    {},
    {
        outputIp: string;
        outputPort: number;
        inputPort: number;
        isConnected: boolean;
    }
> {

    constructor(props: any) {
        super(props);

        this.state = {
            outputIp: '127.0.0.1',
            outputPort: 6667,
            inputPort: 6666,
            isConnected: false
        };
    }

    componentDidMount() {
        window.proxy.getConnectionStatus().then((isConnected) => {
            this.setState({ isConnected: isConnected })
        })

        window.proxy.getDataJson().then((data) => {
            this.setState({
                inputPort: data.inputPort,
                outputPort: data.outputPort,
                outputIp: data.outputIp
            })
        })
    }

    componentWillUnmount() {
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.name === "outputIp") {
            this.setState({ outputIp: event.target.value });
        } else if (event.target.name === "outputPort") {
            let res: number = Number(event.target.value);
            if (!isNaN(res)) this.setState({ outputPort: res });
        } else if (event.target.name === "inputPort") {
            let res: number = Number(event.target.value);
            if (!isNaN(res)) this.setState({ inputPort: res });
        }
    }

    onConnectionClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        window.proxy.connection(this.state.outputIp, this.state.outputPort, this.state.inputPort).then((isStarted) => {
            this.setState({ isConnected: isStarted })
        });
    }

    onDisconnectionClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        window.proxy.disconnection();
        this.setState({ isConnected: false })
    }


    render() {
        return (
            <div className="center">
                {
                    this.state.isConnected ?
                        <>
                            <h1>Actual connection : </h1>
                            <div>Input Port : {this.state.inputPort}</div>
                            <div>Output Ip : {this.state.outputIp}</div>
                            <div>Output Port : {this.state.outputPort}</div>
                        </>
                        :
                        <></>
                }
                <h1>Remote connection</h1 >
                <div className="gridTwoColumn">
                    <label>input port : </label>
                    <input
                        type="text"
                        name="inputPort"
                        value={this.state.inputPort}
                        onChange={(e) => this.handleInputChange(e)}
                    />
                    <label>output ip : </label>
                    <input
                        type="text"
                        name="outputIp"
                        value={this.state.outputIp}
                        onChange={(e) => this.handleInputChange(e)}
                    />
                    <label>output port : </label>
                    <input
                        type="text"
                        name="outputPort"
                        value={this.state.outputPort}
                        onChange={(e) => this.handleInputChange(e)}
                    />
                    <div></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button disabled={this.state.isConnected} onClick={(e) => this.onConnectionClicked(e)}>Connection</button>
                        <button disabled={!this.state.isConnected} onClick={(e) => this.onDisconnectionClicked(e)}>Disconnection</button>
                    </div>
                </div>
            </div >
        );
    }
}
