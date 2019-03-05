import React from 'react';
import { Nav, Navbar, Dropdown } from 'react-bootstrap';

// Assets
import account from '../../assets/Dashboard-Icons/Account.svg';
import logo from '../../assets/logo.svg';

import search from '../../assets/Dashboard-Icons/Search.svg';
import uploadFile from '../../assets/Dashboard-Icons/Upload.svg';
import newFolder from '../../assets/Dashboard-Icons/Add-folder.svg';
import downloadFile from '../../assets/Dashboard-Icons/Download.svg';
import deleteFile from '../../assets/Dashboard-Icons/Delete.svg';
import share from '../../assets/Dashboard-Icons/Share.svg';

import HeaderButton from '../../HeaderButton';

import "./NavigationBar.css";


class NavigationBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menuButton: null,
            navbarItems: props.navbarItems
        };

        if (props.showSettingsButton) {
            this.state.menuButton =
                <Dropdown drop="left" className="settingsButton">
                    <Dropdown.Toggle><HeaderButton icon={account} name="Menu" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item><a href="#">Settings</a></Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={(e) => { localStorage.clear(); window.location.reload();  }}>Sign out</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>;
        }

        if (props.showFileButtons) {
            this.state.navbarItems =
                <Nav className="m-auto">
                    <HeaderButton icon={search} name="Search files" />
                    <HeaderButton icon={uploadFile} name="Upload file" clickHandler={props.uploadFile} />
                    <HeaderButton icon={newFolder} name="New folder" clickHandler={props.createFolder} />
                    <HeaderButton icon={downloadFile} name="Download" />
                    <HeaderButton icon={deleteFile} name="Delete" clickHandler={props.deleteItems} />
                    <HeaderButton icon={share} name="Share" />
                    <input id="uploadFile" type="file" onChange={props.uploadHandler}/>
                </Nav>;
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <Navbar className="p-1" id="mainNavBar">
                <Navbar.Brand>
                    <a href="/"><img src={logo} width='46' /></a>
                </Navbar.Brand>
                <Nav className="m-auto">
                    {this.state.navbarItems}
                </Nav>
                <Nav>
                    {this.state.menuButton}
                </Nav>
            </Navbar>
        );
    }
}

export default NavigationBar;

