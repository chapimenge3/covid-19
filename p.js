const user = require("./models/user")

function callAll() {
    console.log("DSfsd");
    user.find({}, (err, users) => {
        if (err) {
            console.log(err.message);
            return;
        }
        console.log(users);
        
        for (let i in users) {
            console.log(i);
        }
    }) ;
}

callAll() ;