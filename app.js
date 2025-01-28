const express = require('express')
const app = express()
const http = require('http')
const axios = require('axios')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)


const port = process.env.port ||3000
app.use(express.static('public'))

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

let Token=[{token:0,id:0,username:'',password:'',Att:{},loop:0,name:'',subjects:[]}]
let i =0
let goofy = {}
let btnst ={goog0: 0, goog1: 0, goog2: 0, goog3: 0, goog4: 0, goog5: 0}
let j=0
io.on('connection', (socket)=>{
    console.log('A user connected')
    socket.on('btnst',(st)=>{
            btnst=st
    })



    socket.on('Entry',({user,passw,name,socketid})=>{
        for(let i=0; i<Token.length;i++){
            if(Token[i] && user==Token[i].username){
                //console.log(Token)
                io.emit('Confirm',{text:"Proxy device",id:socketid,res:"Proxy"})
                io.emit('l',{l:Token[i].loop,id:socketid})

                return
            }
        }

        Token[i]={username:user,password:passw,id:socketid,loop:0,name:name,subjects:[]}


        axios.post("https://attendance.iitr.ac.in:8000/api/student/getNewStudentSubjects",{"EnrollmentNo":user,"SemesterID":121})
            .then(function (res) { 
                io.emit('course',{res:res.data.data.data,id:socketid})
                // console.log(res.data.data.data)
                res.data.data.data.forEach((sub,t)=>{
                    Token[i-1].subjects[t]={"EnrollmentNo": user,"FacultyId":sub.FacultyIDs,"Name":name,"ProgramID":sub.ProgrameID,"SubBatches":sub.SubBatch,"SubjectArea":sub.SubjectArea,"SubjectId":sub.SubjectID,"SubjectCode":sub.SubjectAlphaCode,"StudentData":"FJ/K49SQY9dTBRH6tsSub4rw6Py5dP3nmSfUokQ5s5aApQgMwBGoqhRDAgnEVlpbxhtOdZ7dYheBvx1/DO5E3aE0Azn/ovF4BCqAgm7F63SV4LanjvoM/FvHsMwZGw3lVuEcbmoJ7yRAU7bMlqv3zgFr+Cke//3XlEcR28Vv6QZ6UGWuuHkwmUh3Luu8pwD47fI/0yAnrnwd0iPbIv0RIlw5YCOegzL625fTOIB4U1JCT1oTLdbWVzPld0A1mqw2IN6DjoUID/E2tPuQi97QOm3PsL86rA96pFBl0QEKP/d7nOV4QdARtprKrvmQmdvW7czENAIUyweeXyjUj2QUHQ==","StudentProData":"F7Mzb4TRTwh4Hb8mX//h8sR1kdXvypMWqNfRt3HEVCXE4i8/T2EFBvkXLSLDCtpgkpP0Y1mJis88f7KeqB8gfN9UxW+PVh3OaX/bnM7qzzErpgZ662xfQonRjsCfRG4sB/OitvcsRHvdbWCR3t1VsH5sBCnrMjNbQBanltPlVgkIbSzI4t9vrlsjUOrvPpcamEPSAllsMvQnNbSlxDLVCsCptftgVtFgCbQlIiaJj3ovDUU75Ci6F9QKysrL5xOTDjoaEgekOJPBAizi7hCtTUP22WOPMWKdKM6gqZ8HMw9+dw3tw7COItCKtrmsfn6zK/ymuqXHuFUy5Uxn675NTA=="}
                    
                })
            })
            .catch(function (err) {
                //console.error(err); 
            })

        axios.post("https://attendance.iitr.ac.in:8000/api/user/authLogin", {"username":`${Token[i].username}`,"password":`${Token[i].password}`})
        .then(function (res) { 
            // console.log(res.data.data.AccessToken,i); 
            Token[i-1].token=res.data.data.AccessToken
        })
        .catch(function (err) { 
            // console.error(err); 
        })
        axios.get(`https://pec.iitr.ac.in:4000/uploads/images/2023/UG/pic/${user}.jpg`, { 
    responseType: 'arraybuffer'
})
        .then(function (res) { 
             
            io.emit('pfp',{pfp:res.data,id:socketid})
        })
        .catch(function (err) { 
            // console.error(err); 
        })
        
        let k = 0;
        Token.forEach((token,n)=>{
        if(goofy[Token[n].id]){return}
            console.log("......")
            console.log(Token[n].username)
            console.log(".......")
        goofy[Token[n].id] = setInterval(() => {
                if(!Token[n].Att){
                    Token[n].Att = [];
                  }
                
                for(let i =0;i<6;i++){
                    if(btnst[`goog${k}`]==1){
                        k++
                        if(k>5){
                            k=0
                        }
                    }
                }  
                
                io.emit('l',{l:Token[n].loop,id:socketid})
                axios.post("https://attendance.iitr.ac.in:8000/api/student/markAttendance", Token[n].subjects[k], {
                    headers: {
                        'AccessToken': `${Token[n].token}`,
                    }
                })
                .then(function (res) { 
                    // console.log(Token[n].username);
                   // console.log(Token[n].subjects)
                    console.log(res.data.message,Token[n].username);
                    io.emit('Confirm',{text:"Logged in Successfully! currently on "+ Token[n].username,id:socketid,res:res.data.message})
                    Token[n].loop++
                })
                .catch(function (err) { 
                    console.error(err); 
                    //clearInterval(goofy[Token[n].id]);
                    //delete(Token[n]);
                    io.emit('Confirm',{text:"The Username or Password may be incorrect",id:socketid,res:"Error"})
                });
        
        
                axios.post("https://attendance.iitr.ac.in:8000/api/student/totelCourseWiaeAttendanceCount", {"EnrollmentNo":`${Token[n].username}`},{
                    headers: {
                        'AccessToken': `${Token[n].token}`,
                    }
                })
                .then(function (res) { 
                    let m=0
                    Token[n].Att=res.data.result
                    // console.log(res.data.result)
                    io.emit('Attcount',{obj:Token[n].Att,id:socketid})
                })
                .catch(function (err) { 
                    //console.error(err); 
                })
        
                k++;
                if(k == 6){
                    k=0
                }
            }, 10000);
        })

            i+=1
        }
        
        )
        socket.on('Resetuser',(user)=>{
            try{
                for(let i =0;i<Token.length;i++){
                    for(let j =0;j<Token.length;j++){
                        try{Token[j].username}
                        catch(error){i++}
                    }
                    if(Token[i].username==user){
                        clearInterval(goofy[Token[i].id])
                        delete Token[i]
                    }
                }
            }
            catch(error){
                //console.log(error)
                console.log('Cannot find the user')
            }
        })
        socket.on('disconnect',()=>{
            console.log('A user left!')
            // Token.forEach((element,n)=>{
            //     if(socket.id == element.id){
            //         clearInterval(goofy[Token[n].id])
            //     }
            // })
        })
    setInterval(()=>{
        for(let i =0 ; i<Token.length; i++){
            try{console.log(Token[i].username)}
            catch(error){}
        }
        console.log("--------------------" + Token)
    },10000)
    
})
server.listen(port, ()=> { 
    console.log(`App is listening on ${port}`)
} )
