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

let Token=[{token:0,id:0,username:'',password:'',Att:{},loop:0}]
let i =0
let goofy = {}
let btnst ={goog0: 0, goog1: 0, goog2: 0, goog3: 0, goog4: 0, goog5: 0}
let subjects = [];
let j=0
io.on('connection', (socket)=>{
    console.log('A user connected')
    socket.on('btnst',(st)=>{
            btnst=st
    })



    socket.on('Entry',({user,passw,socketid})=>{
        for(let i=0; i<Token.length;i++){
            if(Token[i] && user==Token[i].username){
                console.log(Token)
                io.emit('Confirm',{text:"Proxy device",id:socketid,res:"Proxy"})
                return
            }
        }

        Token[i]={username:user,password:passw,id:socketid,loop:0}


        axios.post("https://attendance.iitr.ac.in:8000/api/student/getNewStudentSubjects",{"EnrollmentNo":user,"SemesterID":111})
            .then(function (res) { 
                io.emit('course',{res:res.data.data.data,id:socketid})
                // console.log(res.data.data.data)
                res.data.data.data.forEach((sub,t)=>{
                    subjects[t]={"SubjectId":sub.SubjectID,"ProgramID":sub.ProgrameID,"SubjectCode":sub.SubjectAlphaCode,"FacultyId":sub.FacultyIDs}
                })
            })
            .catch(function (err) {
                console.error(err); 
            })

        axios.post("https://academics.iitr.ac.in:4000/api/pec/checkAuth", {"username":`${Token[i].username}`,"password":`${Token[i].password}`,"confirm":"Yes"})
        .then(function (res) { 
            // console.log(res.data.data.AccessToken,i); 
            Token[i-1].token=res.data.data.AccessToken
        })
        .catch(function (err) { 
            // console.error(err); 
        })
        
        let k = 0;
        Token.forEach((token,n)=>{
        if(goofy[Token[n].id]){return}
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
                axios.post("https://attendance.iitr.ac.in:8000/api/student/markAttendance", subjects[k], {
                    headers: {
                        'Token': `${Token[n].token}`,
                        'Username': `${Token[n].username}`
                    }
                })
                .then(function (res) { 
                    // console.log(Token[n].username);
                    // console.log(subjects[k])
                    // console.log(res.data);
                    io.emit('Confirm',{text:"Logged in Successfully! currently on "+ Token[n].username,id:socketid,res:res.data.message})
                    Token[n].loop++
                })
                .catch(function (err) { 
                    // console.error(err); 
                    clearInterval(goofy);
                    io.emit('Confirm',{text:"The Username or Password may be incorrect",id:socketid,res:"Error"})
                });
        
        
                axios.post("https://attendance.iitr.ac.in:8000/api/student/totelCourseWiaeAttendanceCount", {"EnrollmentNo":`${Token[n].username}`},{
                    headers: {
                        'Token': `${Token[n].token}`,
                        'Username': `${Token[n].username}`
                    }
                })
                .then(function (res) { 
                    let m=0
                    Token[n].Att=res.data.result
                    // console.log(res.data.result)
                    io.emit('Attcount',{obj:Token[n].Att,id:socketid})
                })
                .catch(function (err) { 
                    console.error(err); 
                })
        
                k++;
                if(k == 6){
                    k=0
                }
            }, 2000);
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
                console.log(error)
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
    
})
server.listen(port, ()=> { 
    console.log(`App is listening on ${port}`)
} )
