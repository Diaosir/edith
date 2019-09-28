import './index.scss'
import {useState, useEffect, createRef, Component } from 'react'
interface Props {
    LeftComponent: any;
    RightComponent: any;
    defaultLeftWidth: string | number;
}
function handleMouseMove() {

}
export default class Resizer extends Component<Props, any> {
    public resizerRef: any;
    public resizerContainerRef: any;
    public mouseDownClientX: number;
    public disabledMove: boolean = true;
    constructor(props) {
        super(props)
        this.state = {
            leftWidth: '50%'
        }
        this.resizerContainerRef = createRef()
        this.resizerRef = createRef()
    }
    componentDidMount() {
        const { defaultLeftWidth } = this.props;
        this.setState({
            leftWidth: defaultLeftWidth || this.resizerContainerRef.current.clientWidth / 2
        })
        // this.bindEvent();
    }
    bindEvent() {
        const resizerDom: Document = this.resizerRef.current;
        resizerDom.addEventListener('mousedown', (e) => {
            console.log(e)
        })
    }
    handleMouseUp() {
        this.disabledMove = true;
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
        console.log(111)
    }
    handleMouseDown(e) {
        this.mouseDownClientX = e.clientX;
        this.disabledMove = false;
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    handleMouseMove(e) {
        if (this.disabledMove) {
            return;
        }
        const leftWidth = this.state.leftWidth - (this.mouseDownClientX - e.clientX);
        console.log(this.mouseDownClientX - e.clientX)
        this.setState({
            leftWidth
        })
    }
    render() {
        const { LeftComponent, RightComponent } = this.props;
        return (
        <div className='resizer-container' ref={this.resizerContainerRef}>
            <div className="left-resizer" style={{width: this.state.leftWidth}}>
                {LeftComponent}
            </div>
            <div className="Resizer vertical" 
                onMouseDown={this.handleMouseDown.bind(this)} 
                onMouseUp={this.handleMouseUp.bind(this)} 
                ref={this.resizerRef}></div>
            <div className="rigth-resizer">
                {RightComponent}
            </div>
        </div>
        )
    }
}