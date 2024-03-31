const socket = io()

const user = [{
    id:socket.id,
    course:{}
}]

function submit(){
    let username = document.getElementById("enroll").value;
    let password = document.getElementById("pass").value;
    socket.emit('Entry',{user:username,passw:password,socketid:socket.id})
}

socket.on('Confirm',({text,id,res})=>{
    if(id!=socket.id){return}
    document.getElementById("text").innerText = text;
    document.getElementById("Status").innerText = res.message;
})

socket.on('l',({l,id})=>{
    if(id!=socket.id){return}
        document.getElementById("time").innerText = l
})

socket.on('Attcount',({obj,id})=>{
    // console.log(obj)
    if(id!=socket.id){return}
    for(let i =0;i<obj.length;i++){
        for(let j=0;j<user[socket.id].course.length;j++){
            let t=0
            if(user[socket.id].course[j].SubjectAlphaCode==obj[i].SubjectCode){
                document.getElementById("goofia"+j).innerText=obj[i].AttCount
            }
        }
    }
})

socket.on('course',({res,id})=>{
    user[id]= {course:res}
    // console.log(res)
    if(id!=socket.id){return}
    for(let i =0 ; i <res.length;i++){
        document.getElementById("goof"+i).innerText=res[i].SubjectAlphaCode
    }
})