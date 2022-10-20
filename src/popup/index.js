import React  from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import {USER_LOGINS_KEY, getLocalStorageElems, USER_SETTINGS_KEY} from '../utils/utils'


/** Pop-it like its hot
 * 
 * Renders the popup react app
 * Most of the logic for popup.html 
 * is handled in the react app
 */


const checkLogin = async () => {
    const user = await getLocalStorageElems(USER_LOGINS_KEY)
    // could check with server but for now lets not slow down the app
    return user[USER_LOGINS_KEY]
}

const getSettings = async () => {
    const settings = await getLocalStorageElems(USER_SETTINGS_KEY)
    return settings[USER_SETTINGS_KEY]
}


const render = (user, settings) => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
         <Popup logInState={user.isLoggedIn } userIdFromStorage={user.userId} 
                passWordFromStorage={user.passWord}
                readChecked={settings.read} writeChecked={settings.write}/>
    </React.StrictMode>
  );
}

const handlePopUpClick = async () => {
    const user = await checkLogin()
    const settings = await getSettings()
    render(user, settings)
}

 document.addEventListener('DOMContentLoaded', handlePopUpClick)




