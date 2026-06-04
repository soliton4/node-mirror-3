
import uiFactory from './uiFactory';

import List from './ui/List.jsx';

import EventEmitter from '../../../shared/EventEmitter.js'

class IVEditorModel {

  #value = "";
  #parseError = null;
  #tree = [];
  #factory;
  #emitter;

  constructor() {
    this.#factory = uiFactory.create();
    this.#emitter = new EventEmitter();
  }

  on(eventName, callback) {
    return this.#emitter.on(eventName, callback);
  }
  #emit(event, ...args){
    this.#emitter.emit(event, ...args);
  }

  factory() {
    return this.#factory;
  }
  
  #createTree (newTree) {
    // create a ui element for each node
    this.#tree = newTree.map(node => {
      return this.#factory.create({
        node: node,
        model: this
      });
    });
    // and close with an end node
    this.#tree.push(this.#factory.createEnd({
        model: this
    }));
    this.#tree[0].setFocus(true);
    this.#emit("change");
  }
  
  setValue (parValue) {
    this.#value = parValue;

    let newTree = [];

    try {
      const parsed = JSON.parse(this.#value);
  
      this.#parseError = null;
      if (Array.isArray(parsed)){
        newTree = parsed;
      }else{
        newTree = [parsed];
      }
  
    } catch (err) {
  
      if (this.#value === ""){
        this.#parseError = null;
        
      }else{
        this.#parseError = err.message;

        newTree = [{
          type: "error",
          message: err.message
        }];
      }
    }
    this.#createTree(newTree);
    
  }

  render (){
    return null;
    return React.createElement(List, {
      data: this.#tree,
      model: this,
    });
  }
  
};


export default IVEditorModel;


