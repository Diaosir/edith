import React from 'react';
import SplitPane from 'react-split-pane';

interface Props {
    LeftComponent: any;
    RightComponent: any;
    defaultLeftWidth?: string | number;
}
export default class Resizer extends React.Component<Props, any> {
    public resizerRef: any;
    public resizerContainerRef: any;
    public mouseDownClientX: number;
    public disabledMove: boolean = true;
    constructor(props) {
        super(props)
    }
    componentDidMount() {
    }
    render() {
        const { LeftComponent, RightComponent } = this.props;
        return (
        <SplitPane 
            split="vertical" 
            minSize={200} 
            defaultSize={'50%'}
            resizerStyle={{
                width: 5
            }}
            >
            {LeftComponent}
            {RightComponent}
        </SplitPane>
        );
    }
}