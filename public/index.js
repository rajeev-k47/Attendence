const socket = io()

const user = [{
    id:socket.id,
    course:{}
}]
let username
let password
let uname
function submit(){
    document.getElementById('submit').style.backgroundColor='red'
    username = document.getElementById("enroll").value;
    password = document.getElementById("pass").value;
    uname = document.getElementById("name").value;
    socket.emit('Entry',{user:username,passw:password,name:uname,socketid:socket.id})
    // document.getElementById("enroll").value='';
    // document.getElementById("pass").value='';
}

socket.on('Confirm',({text,id,res})=>{
    if(id!=socket.id){return}
    document.getElementById("text").innerText = text;
    document.getElementById("Status").innerText = res;

    if(text=="Proxy device"){
        const Button = document.createElement("button");
        Button.innerHTML = "Reset";
        Button.style.fontSize="10px";
        Button.style.width="fit-content"
        Button.id= "Reset"
        Button.addEventListener("click", () => {
            socket.emit("Resetuser",username)
        });
        const Div = document.getElementById("text");
         Div.appendChild(Button);
    }
})
socket.on('pfp',({pfp,id})=>{
    if(id!=socket.id){return}
    const imageData = arrayBufferToBase64(pfp);
    const imgElement = document.createElement('img');
    imgElement.src = `data:image/jpeg;base64,${imageData}`;
    imgElement.style.width="35px"
    imgElement.style.border="2px solid black"
    imgElement.style.borderRadius="4px"
    imgElement.style.marginLeft="30px"
    Div = document.getElementById("btn");
    Div.appendChild(imgElement)
    // Div.style.marginLeft="10px"
    
    
    // console.log(imageData)
})
socket.on('l',({l,id})=>{
    if(id!=socket.id){return}
        document.getElementById("time").innerText = l
})

socket.on('Attcount',({obj,id})=>{
    // console.log(obj)
    if(id!=socket.id){return}
    document.getElementById('submit').style.backgroundColor='rgb(0,0,0,0)'
    for(let i =0;i<obj.length;i++){
        for(let j=0;j<user[socket.id].course.length;j++){
            let t=0
            if(user[socket.id].course[j].SubjectAlphaCode==obj[i].SubjectCode){
                document.getElementById("goofia"+j).innerText=obj[i].AttCount
            }
        }
    }
    for(let j=0; j<obj.length;j++){
        document.getElementById("goog"+j).removeAttribute("hidden")
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
let buttonst = {goog0: 0, goog1: 0, goog2: 0, goog3: 0, goog4: 0, goog5: 0}
function skip(btn) {
    var button = document.getElementById(btn);
    var computedStyle = window.getComputedStyle(button);
    var currentColor = computedStyle.backgroundColor;

    if (currentColor === "rgba(0, 255, 54, 0.4)") {
        button.style.backgroundColor = "rgba(245, 25, 100, 0)";
    } else {
        button.style.backgroundColor = "rgba(0, 255, 54, 0.4)";
    }
    for(let i =0;i<6;i++){
        if(btn==`goog${i}`){
            buttonst[`goog${i}`] = buttonst[`goog${i}`] === 1 ? 0 : 1;
        }
    }
    socket.emit('btnst',buttonst)
}
