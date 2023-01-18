import React from 'react';

import logo from '../assets/logo.svg';


const NavBar = ({ account }) => {
  return (
    <nav className='navbar navbar-dark bg-dark'>
      <div>
        <img src={logo} alt="logo" className="w-32 cursor-pointer" />
      </div>
      <div className="text-white">Address of account : {account}</div>

    </nav>
  );
};

export default NavBar;
