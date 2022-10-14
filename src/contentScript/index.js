import React from "react";
import ReactDOM from "react-dom";
import ContentScript from "./ContentScript";


let domElem = document.body
let root = ReactDOM.createRoot(domElem)
root.render(
    <ContentScript/>
)