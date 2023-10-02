function html({url, text}){
    return `
        <div style="max-width: 700px; margin: auto; border: 10px solid gray; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: capitalize; color: teal;">
            Welcome to the <p style="font-weight: bolder; color: rgb(2, 255, 255);"> AFG - DEVES</p> channel
        </h2>
        <p>Please click the below button to verify your account!</p>

        <a href=${url}style="background: red; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">
        ${text}
    </a>

    <p>If the button does not work in any reason, please click link bellow!</p>
    <div>${url}</div>
 </div>
    `
};

module.exports = html