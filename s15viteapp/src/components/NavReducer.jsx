import React from 'react'

const NavReducer = (state='page1', action) => {
    switch(action.type){
        case "page":
            state=action.data;
            return state;
        default: return state;
    }
  
}
export default NavReducer
