import React from "react";

export default class BlackList extends React.Component<any, {
    blackListPathBuffer: string[];
    blackListPath: string[];
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            blackListPathBuffer: [],
            blackListPath: []
        };


    }

    componentDidMount() {
        window.proxy.getBlackListPath().then((response) => {
            this.setState({ blackListPath: response })
        })
    }

    componentWillUnmount() {
    }

    onFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
        if (e.target.files) {
            for (let file of e.target.files) {
                if (!this.state.blackListPathBuffer.includes(file.path)) {
                    this.state.blackListPathBuffer.push(file.path);
                    this.setState({ blackListPathBuffer: this.state.blackListPathBuffer });
                }
            }
        }
        e.target.value = ""

    }

    onRedCrossClicked(e: React.MouseEvent<HTMLSpanElement, MouseEvent>, path: string): void {
        for (let blacklistPath of this.state.blackListPathBuffer) {
            if (blacklistPath == path) {
                this.state.blackListPathBuffer.splice(this.state.blackListPathBuffer.indexOf(path), 1);
                this.setState({ blackListPathBuffer: this.state.blackListPathBuffer });
            }
        }
    }

    setBlackList(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        window.proxy.setBlackListPath(this.state.blackListPathBuffer);
        this.setState({
            blackListPath: this.state.blackListPathBuffer,
            blackListPathBuffer: []
        })
    }

    render() {
        return (
            <div className="center">
                <h1>BlackList Manager</h1 >
                <div>
                    {
                        this.state.blackListPath.length ?
                            <div>
                                <h2>Selected files :</h2>
                                {this.state.blackListPath.map((data, index) => (
                                    <div key={index}>{data}</div>
                                ))}
                            </div>
                            :
                            <></>
                    }

                    <h2>Choose files :</h2>
                    <div className="gridTwoColumn">
                        <label>BlackList Files</label>
                        <input type="file" multiple onChange={(e) => this.onFileChange(e)} />
                        <div style={{ gridColumn: 'span 2' }}>
                            {this.state.blackListPathBuffer.map((data, index) => (
                                <div style={{ marginBottom: "10px" }} key={index}>{data}<span className="redCross" onClick={(e) => this.onRedCrossClicked(e, data)}> X</span></div> // Rendering each item in proxyData array
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}><button onClick={(e) => this.setBlackList(e)}>Ok</button></div>
                </div>
            </div>
        );
    }

}

