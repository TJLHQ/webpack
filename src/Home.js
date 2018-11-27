import React,{Component} from 'react';
let name = 'Alan';
import './home.css'
export default class Hello extends Component{
    render() {
        return (
            <div className="home">
            {name}
            </div>
    );
    }
}