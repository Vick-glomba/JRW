const ingresarChat = document.querySelector("#ingresarChat")
const botonPj1 = document.querySelector("#botonPj1")
const boton1img = document.querySelector("#botonPj1 img")
const p1 = document.querySelector("#p1")
const botonPj2 = document.querySelector("#botonPj2")
const boton2img = document.querySelector("#botonPj2 img")
const p2 = document.querySelector("#p2")
const botonPj3 = document.querySelector("#botonPj3")
const boton3img = document.querySelector("#botonPj3 img")
const p3 = document.querySelector("#p3")
const username = document.querySelector("#nombreInput")
const password = document.querySelector("#password")
const loginform = document.querySelector('#loginform')
const selectPersonaje = document.querySelector('#selectPersonaje')
let login;
let dataToken;
let personajeSelect;
let user
let personaje1
let personaje2
let personaje3




localStorage.clear()

const  getPersonaje = async (token, uid, slot) => {
    const pathImg = "assets/images/users/"
    await fetch(`/api/personaje/?uid=${uid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
    }).then(resp => resp.json())
        .then(resp => {
            if (resp) {
                switch (slot) {
                    case "personaje1":
                        personaje1 = resp.personaje
                        boton1img.src = resp.personaje.imagen?pathImg + resp.personaje.imagen: path.pathImg + "fondonegro.jpg"
                        p1.innerText = resp.personaje.nombre
                        break;
                    case "personaje2":
                        personaje2 = resp.personaje
                        boton2img.src =resp.personaje.imagen?pathImg + resp.personaje.imagen: path.pathImg + "fondonegro.jpg"
                        p2.innerText = resp.personaje.nombre
                        break;
                    case "personaje3":
                        personaje3 = resp.personaje
                        boton3img.src = resp.personaje.imagen?pathImg + resp.personaje.imagen: path.pathImg + "fondonegro.jpg"
                        p3.innerText = resp.personaje.nombre
                        break;
                }
            }

        }).catch(e => console.log("NO ES PERSONAJE PROPIO"))
}

    

    const  getUsuario = async (token, uid) => {
        await fetch(`/api/user/?uid=${uid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
        }).then(resp => resp.json())
            .then(resp => {
                if (resp) {
                    user = resp.user
                }
                
            })
            
            if(user.personaje1){
                await getPersonaje(login.token, user.personaje1, "personaje1")
            }
            if(user.personaje2){
                await getPersonaje(login.token, user.personaje2, "personaje2")
            }
            if(user.personaje3){
                await getPersonaje(login.token, user.personaje3, "personaje3")
            }
   
    }
   
  
    //llamar la verificacion asi
    // await verificar(login.token)
    // console.log(dataToken)

const verificar = async (token) => {


    await fetch('/api/verifyToken', {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
    }).then(resp => resp.json())
        .then(resp => {
            if (resp.token) {
                dataToken = resp.token
            }

        }).catch("falla la verificacion")

}

const post = async (e) => {

    e.preventDefault();

    await fetch('/api/users/login', {
        method: "POST",
        body: JSON.stringify({
            username: username.value,
            password: password.value
        }),
        headers: {
            "Content-Type": "application/json"
        },
    }).then(resp => resp.json())
        .then(resp => {
            if (resp.token) {
                localStorage.setItem('token', resp.token)
                loginform.style.visibility = "hidden"
                loginform.classList.add('esconder')
                selectPersonaje.style.visibility = "visible"
                selectPersonaje.classList.remove('esconder')
                login = resp
                // window.location = 'chat.html';
            }
            
        })
        if(login){

            await getUsuario(login.token, login.userData.userID)
        }
        
        
        
    }

    const loginPersonaje = async (uid) => {

        await fetch('/api/personaje/login', {
            method: "POST",
            body: JSON.stringify({
                personajeID:`${uid}`
            }),
            headers: {
                "Content-Type": "application/json"
            },
        }).then(resp => resp.json())
            .then(resp => {
                if (resp.token) {
                    localStorage.setItem('tokenPJ', resp.token)
                  //  login = resp
                    login.tokenPj = resp.token
                    // window.location = 'chat.html';
                }
                
            })

    }

ingresarChat.addEventListener('click', post)


botonPj1.addEventListener('click', async(e) => {
    e.preventDefault()
    personajeSelect = personaje1? personaje1 : null
   
    if(!personajeSelect){
        console.log("crear personaje")
    } else {
       await loginPersonaje(personajeSelect.uid)
       window.location = 'chat.html';
    }
})
botonPj2.addEventListener('click', async(e) => {
    e.preventDefault()
    personajeSelect = personaje2? personaje2 : null
    
    if(!personajeSelect){
        console.log("crear personaje")
    } else{
        await loginPersonaje(personajeSelect.uid)
        window.location = 'chat.html';
    }
})
botonPj3.addEventListener('click', async(e) => {
    e.preventDefault()
    personajeSelect = personaje3? personaje3: null
    
    if(!personajeSelect){
        console.log("crear personaje")
    } else {
        await loginPersonaje(personajeSelect.uid)
        window.location = 'chat.html';
    }
})

