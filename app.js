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
                console.log(Token)
                io.emit('Confirm',{text:"Proxy device",id:socketid,res:"Proxy"})
                io.emit('l',{l:Token[i].loop,id:socketid})

                return
            }
        }

        Token[i]={username:user,password:passw,id:socketid,loop:0,name:name,subjects:[]}


        axios.post("https://attendance.iitr.ac.in:8000/api/student/getNewStudentSubjects",{"EnrollmentNo":user,"SemesterID":111})
            .then(function (res) { 
                io.emit('course',{res:res.data.data.data,id:socketid})
                // console.log(res.data.data.data)
                res.data.data.data.forEach((sub,t)=>{
                    Token[i-1].subjects[t]={"EnrollmentNo": user,"FacultyId":sub.FacultyIDs,"Name":name,"ProgramID":sub.ProgrameID,"SubBatches":sub.SubBatch,"SubjectArea":sub.SubjectArea,"SubjectId":sub.SubjectID,"SubjectCode":sub.SubjectAlphaCode,"StduentData":"tPqbeVhji4FC5n2dWTIuGTNFKbyBHpwhJKbKaGccClFYNb5ZDXTA51wtGO3DY9wwNvptXaJ55dT27XwumKIgEsFN98yd5qs2TUhK/XNj4ti734rQLi10l72jFmyprwVWG2mslx6FWfs4UiP90M8eTRsW5bkITjTCc5jtv8mLAx45cwhoHGN6og7P6PCEUdDS8VmjrLk+CB+sNWCh7r1sdYjaTSNfsxg1nQAOg9BV/KQI7wNH4cBN777VT7yRimkIqQNqijN1cgnKepKXWTJ+9XdRk85bH3fHf2PMPrRTlocXjqbgbkSAD8/Z6KItqQKvqsdT9WouE8zPPWrYmd8sow==","StudentProData":"Nzy+M2Ad4yKgGO9B4+uEs9zvVRqZewyb8pnz2mEzt8QQN/OrBejZrhxnDCoXjS0aofOA78ZkGP38ytC9pl1Incb9vq729lqzlDXfp6Z0p3a4mnnFmNB1AjpkFNay4+4XU0il6dTIUVYA59eiGcnktoRXHi+3QAUO+l3+85etyg5yUhFhCatN3QDly/kC65GTAllLiD7aLpVQVmFbYwSTZa1euhjCt/F90+zAtUd7LK+evU3m9NHiKqwgSezmcvjf94FVdu42RNr744HvE+GH+ha4U2BHhwLCeKeuPKQuxmGq8aybqcdhH3CV0RwH4SNwcWCyfmIB02yfLa1t3BuL3A=="}
                    
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
                axios.post("https://attendance.iitr.ac.in:8000/api/student/markAttendance", Token[n].subjects[k], {
                    headers: {
                        'Token': `${Token[n].token}`,
                        'Username': `${Token[n].username}`
                    }
                })
                .then(function (res) { 
                    // console.log(Token[n].username);
                    console.log(Token[n].subjects)
                    console.log(res.data.message,Token[n].username);
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
            }, 3000);
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
