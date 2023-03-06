//https://github.com/karlhadwen/react-dropdown-menu/blob/master/src/Dropdown.js
import React, { useState } from 'react';
import onClickOutside from 'react-onclickoutside';


function Dropdown({ title, items, multiSelect = false, nearbyListStateSetter}) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const toggle = () => setOpen(!open);


  //for closing the nearby list view when the menu is open
  if (open) {
    nearbyListStateSetter(false);
  }

  Dropdown.handleClickOutside = () => setOpen(false);

  function handleOnClick(item) {

    //we do nothing if the option is already enable. This prevents no markers from being show on the map
    if (item.markertoggle) {
      return null;
    }
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].id != item.id){
        items[i].markersetterFunction(false);
      }
    }
    //for toggling the markers visibility
    item.markersetterFunction(!item.markertoggle);

    //for changing search bar dataset. Dataset is only change if 
    //the enabled property of the dataset is true
    if (!item.markertoggle) {
      item.datasetSetter(item.dataset);
    }
    
    if (!selection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setSelection([item]);

      } 
      
      else if (multiSelect) {
        setSelection([...selection, item]);
      }
    } 
    
    else {
      let selectionAfterRemoval = selection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setSelection([...selectionAfterRemoval]);
    }
  }

  function isItemInSelection(item) {
    if (selection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  return (
    <div className="dd-wrapper" id = "dropdownmenu">
      <div
        tabIndex={0}
        className="dd-header"
        role="button"
        onKeyPress={() => toggle(!open)}
        onClick={() => toggle(!open)}
      >
        <div className="dd-header__title">
          <p className="dd-header__title--bold">{title}</p>
        </div>
      </div>
      {open && (
        <ul className="dd-list">
          {items.map(item => (
            <li className="dd-list-item" key={item.id}>
              <button className = "dd-list-button" type="button" onClick={() => handleOnClick(item)}>
                <span>{item.value}</span>
                <span>{isItemInSelection(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => Dropdown.handleClickOutside,
};

export default onClickOutside(Dropdown, clickOutsideConfig);