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

let subjects = [];
let j=0
io.on('connection', (socket)=>{
    console.log('A user connected')
    socket.on('Entry',({user,passw,socketid})=>{
        for(let i=0; i<Token.length;i++){
            if(Token[i] && user==Token[i].username){
                io.emit('Confirm',{text:"Your Attendance is running on another device",id:socketid})
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

                if(k == 6){
                    k=0
                }
                Token[n].loop++
                io.emit('l',{l:Token[n].loop,id:socketid})
                axios.post("https://attendance.iitr.ac.in:8000/api/student/markAttendance", subjects[k], {
                    headers: {
                        'Token': `${Token[n].token}`,
                        'Username': `${Token[n].username}`
                    }
                })
                .then(function (res) { 
                     console.log(Token[n].loop);
                    // console.log(subjects[k])
                    // console.log(res.data);
                    io.emit('Confirm',{text:"Logged in Successfully! currently on "+ Token[n].username,id:socketid,res:res.data})
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
            }, 2000);
        })

            i+=1
        }
        
        )
        socket.on('disconnect',()=>{
            console.log('A user left!')
            Token.forEach((element,n)=>{
                if(socket.id == element.id){
                    clearInterval(goofy[Token[n].id])
                    delete Token[n]
                }
            })
        })
    
})
server.listen(port, ()=> { 
    console.log(`App is listening on ${port}`)
} )
