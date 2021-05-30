function cargarPrincipal(){
    window.localStorage.removeItem("nombreElemento");
    window.localStorage.removeItem("tipoElemento");
    window.localStorage.removeItem("editar");
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    if(!datos){
        datos = {
            personas:[
                {nombre: "Persona ejemplo", fechaI: "2000-04-01", fechaF: "2000-02-02", img:"https://upload.wikimedia.org/wikipedia/commons/9/95/Wikipedia-es-logo-black-on-white.png", wiki:"https://www.wikipedia.org/"},
                {nombre: "Tim Berners-Lee", fechaI: "1955-06-08", fechaF: "2050-01-02", img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg", wiki: "https://es.wikipedia.org/wiki/Tim_Berners-Lee"},
                ],
            productos:[
                {nombre: "Producto ejemplo", fechaI: "2000-01-01", fechaF: "2000-02-02", img:"https://upload.wikimedia.org/wikipedia/commons/9/95/Wikipedia-es-logo-black-on-white.png", wiki:"https://www.wikipedia.org/", personas: ["Persona ejemplo"], entidades: ["Entidad ejemplo"]},
                {nombre: "C", fechaI: "1972", fechaF: "", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/The_C_Programming_Language_logo.svg/1024px-The_C_Programming_Language_logo.svg.png", wiki:"https://es.wikipedia.org/wiki/C_(lenguaje_de_programaci%C3%B3n)"},
                ],
            entidades:[
                {nombre: "Entidad ejemplo", fechaI: "2000-01-01", fechaF: "2000-02-02", img:"https://upload.wikimedia.org/wikipedia/commons/9/95/Wikipedia-es-logo-black-on-white.png", wiki:"https://www.wikipedia.org/", personas: ["Persona ejemplo"]},
                ],
        }
        window.localStorage.setItem("datos", JSON.stringify(datos)); 
    }
    cargarTabla();
    let logeado = window.localStorage.getItem("login");
    if(logeado){
        mostrarWriter();
    }
    else{
        ocultarWriter(); 
    }
}

// Login, Logout, permisos

function onLogin(event){
    event.preventDefault();
    let authHeader = null;
    $.post(
        "/access_token",
        $("#form-login").serialize(),
        null
        ).success(function (data, textStatus, request) {
            // => show scopes, users, products, ...
            authHeader = request.getResponseHeader('Authorization');
            window.localStorage.setItem("login", JSON.stringify(authHeader)); 
            console.log(data);
            if(esWriter(authHeader)){
                mostrarWriter();
            }
        }).fail(function (xhr) {
            if (xhr.responseJSON && xhr.responseJSON.message) {
                message = xhr.responseJSON.message;
            }
        alert("Usuario o contraseña erróneo\n" + message)
        }
    );
}

function esWriter(authHeader){
    let token = authHeader.split(' ')[1];   // Elimina 'Bearer '
    let myData = JSON.parse(atob(token.split('.')[1]));
    return myData.scopes.find(function(string){
        return string == 'writer';
    });
}

function onLogout(event, button){
    event.preventDefault();
    window.localStorage.removeItem("login");
    ocultarWriter();
}

function crearBotonLogout(){
    let div = document.getElementById("contenedorLogin").firstElementChild;
    let boton = document.createElement("input");
    boton.setAttribute("id", "logout");
    boton.setAttribute("class", "btn btn-primary");
    boton.setAttribute("type", "button");
    boton.setAttribute("value", "Cerrar sesión");
    boton.setAttribute("onclick", "onLogout(event,this);");
    div.appendChild(boton);
}

function crearFormularioLogin(){
    let div = document.getElementById("contenedorLogin").firstElementChild;
    let formulario = document.createElement("form");
    formulario.setAttribute("id", "form-login");
    formulario.setAttribute("method", "post");
    formulario.setAttribute("onsubmit", "onLogin(event);");
    crearUserdiv(formulario);
    crearPwddiv(formulario);
    let inp = document.createElement("input");
    inp.setAttribute("id", "btn-login");
    inp.setAttribute("class", "btn btn-primary");
    inp.setAttribute("type", "submit");
    inp.setAttribute("value", "Iniciar sesión");
    formulario.append(inp);
    crearBotonRegistro(formulario);
    div.appendChild(formulario);
}

function crearBotonRegistro(div){
    let registro = document.createElement("a");
    registro.setAttribute("id", "registro");
    registro.setAttribute("class", "btn btn-primary");
    registro.setAttribute("role", "button");
    registro.setAttribute("href", "./registro.html");
    registro.innerHTML = "Registrarse";
    div.appendChild(registro);
}


function crearUserdiv(div){
    let ud = document.createElement("div");
    ud.setAttribute("id", "userDiv");
    ud.setAttribute("class", "row mb-3");
    let lbl = document.createElement("label");
    lbl.setAttribute("class", "col-sm2 col-form-label");
    lbl.setAttribute("for", "username");
    lbl.innerHTML = "Usuario: ";
    let subdiv = document.createElement("div");
    subdiv.setAttribute("class", "col-sm-10");
    ud.appendChild(subdiv);
    let input = document.createElement("input");
    input.setAttribute("id", "username");
    input.setAttribute("class", "form-control");
    input.setAttribute("type", "text");
    input.setAttribute("name", "username");
    subdiv.appendChild(lbl);
    subdiv.appendChild(input);
    div.appendChild(ud);
}

function crearPwddiv(div){
    let pd = document.createElement("div");
    pd.setAttribute("id", "passwordDiv");
    pd.setAttribute("class", "row mb-3");
    let lbl = document.createElement("label");
    lbl.setAttribute("class", "col-sm2 col-form-label");
    lbl.setAttribute("for", "password");
    lbl.innerHTML = "Contraseña ";
    let subdiv = document.createElement("div");
    subdiv.setAttribute("class", "col-sm-10");
    pd.appendChild(subdiv);
    let input = document.createElement("input");
    input.setAttribute("id", "password");
    input.setAttribute("class", "form-control");
    input.setAttribute("type", "password");
    input.setAttribute("name", "password");
    subdiv.appendChild(lbl);
    subdiv.appendChild(input);
    div.appendChild(pd);
}

function ocultarWriter(){
    let botonLogout = document.getElementById("logout");
    if(botonLogout)
        botonLogout.remove();
    let botones = document.getElementsByClassName("btn btn-secondary");
    for(b of botones){
        b.style.display = "none";
    }
    crearFormularioLogin();
}

function mostrarWriter(){
    let form = document.getElementById("form-login");
    if(form)
        form.remove();
    let registro = document.getElementById("registro");
    if(registro)
        registro.remove();
    let botones = document.getElementsByClassName("btn btn-secondary");
    for(b of botones){
        b.style.display = "block";
    }
    crearBotonLogout();
}

//  Carga elementos

function cargarTabla(){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let div = document.getElementById("divPer");
    for(persona of datos.personas){
        cargarElementoBasico(div, persona);
        div.innerHTML += "<br>";
    }
    div = document.getElementById("divProd");
    for(producto of datos.productos){
        cargarElementoBasico(div, producto);
        div.innerHTML += "<br>";
    }
    div = document.getElementById("divEnt");
    for(entidad of datos.entidades){
        cargarElementoBasico(div, entidad);
        div.innerHTML += "<br>";
    }
}

function cargarElementoBasico(div, elemento){
    let contenedor = document.createElement("div");
    contenedor.setAttribute("class", "card");
    div.appendChild(contenedor);
    let contenido = document.createElement("div");
    contenido.setAttribute("class", "card-body text-center");
    contenedor.appendChild(contenido);
    let nombre = document.createElement("a");
    nombre.setAttribute("class", "nombreElemento");
    nombre.setAttribute("href", "./verElemento.html");
    switch(div.id){
        case "divPer":
            nombre.setAttribute("data-tipoelemento", "persona");
            break;
        case "divProd":
            nombre.setAttribute("data-tipoelemento", "producto");
            break;
        case "divEnt":
            nombre.setAttribute("data-tipoelemento", "entidad");
            break;
    }
    nombre.setAttribute("onclick", "verElemento(event);");
    nombre.innerHTML = elemento.nombre;
    contenido.appendChild(nombre);
    let img = document.createElement("img");
    img.setAttribute("src", elemento.img);
    img.setAttribute("width", "50");
    img.setAttribute("heigth", "50");
    contenido.appendChild(img);
    crearBotones(contenedor);
}

function cargarDatosComunes(div, elemento){
    let item = document.createElement("div");
    item.setAttribute("class", "card");
    div.appendChild(item);
    let body = document.createElement("div");
    body.setAttribute("class", "card-body text-center");
    item.appendChild(body);
    let nombre = document.createElement("h3");
    nombre.setAttribute("class", "text-center");
    body.appendChild(nombre);
    nombre.innerHTML = elemento.nombre;
    body.innerHTML += "<br>";
    let fechaI = document.createElement("p");
    fechaI.innerHTML = "Fecha nacimiento: " + elemento.fechaI;
    body.appendChild(fechaI);
    let fechaF = document.createElement("p");
    fechaF.innerHTML = "Fecha defunción: " + elemento.fechaF;
    body.appendChild(fechaF);
    let img = document.createElement("img");
    img.setAttribute("id","imagen");
    img.setAttribute("src", elemento.img);
    img.setAttribute("width", "100");
    img.setAttribute("heigth", "100");
    body.appendChild(img);
    body.innerHTML += "<br>";
    let link = document.createElement("a");
    link.setAttribute("href", elemento.wiki);
    link.innerHTML = "Wiki";
    body.appendChild(link);
    crearBotones(item);
    return item;
}

function crearBotones(div){
    let botones = document.createElement("div");
    botones.setAttribute("class", "btn-group");
    botones.setAttribute("role", "group");
    botones.setAttribute("aria-label", "botones");
    div.appendChild(botones);
    crearBotonEditar(botones);
    crearBotonEliminar(botones);
}

function crearBotonEditar(div){
    let button = document.createElement("a");
    button.setAttribute("class", "btn btn-secondary");
    button.setAttribute("href", "./editarElemento.html");
    button.setAttribute("onclick", "setEditar(event);");
    button.innerHTML = "Editar";
    div.appendChild(button);
}

function crearBotonEliminar(div){
    let button = document.createElement("a");
    button.setAttribute("class", "btn btn-secondary");
    button.setAttribute("href", "./inicio.html");
    button.setAttribute("onclick", "eliminarElemento(event);");
    button.innerHTML = "Eliminar";
    div.appendChild(button);
}

function verElemento(event){
    window.localStorage.setItem("nombreElemento", event.target.innerHTML);
    window.localStorage.setItem("tipoElemento", event.target.getAttribute("data-tipoElemento"));
}

function cargarPagDetalles(){
    cargarElementoDetalles();
    let logeado = window.localStorage.getItem("login");
    if(logeado){
        mostrarWriter();
    }
    else{
        ocultarWriter(); 
    }
}

function cargarElementoDetalles(){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let nombre = window.localStorage.getItem("nombreElemento");
    let tipoElemento= window.localStorage.getItem("tipoElemento");
    let div = document.getElementById("elemento");
    let elemento;
    switch(tipoElemento){
        case "persona":
            elemento = datos.personas.find(x => x.nombre === nombre);
            break;
        case "producto":
            elemento = datos.productos.find(x => x.nombre === nombre);
            break;
        case "entidad":
            elemento = datos.entidades.find(x => x.nombre === nombre);
            break;
    }
    cargarDatosComunes(div, elemento);
    cargarRelaciones(div.firstElementChild.firstElementChild, elemento);
}

function cargarRelaciones(div, elemento){
    if(elemento.personas!=null){
        let part1 = document.createElement("p");
        div.appendChild(part1);
        part1.innerHTML = "Personas participantes:";
        for(persona of elemento.personas){
            let personahtml = document.createElement("a");
            div.appendChild(personahtml);
            personahtml.innerHTML = persona;
            personahtml.setAttribute("class", "enlace");
            personahtml.setAttribute("href", "./verElemento.html");
            personahtml.setAttribute("data-tipoelemento", "persona");
            personahtml.setAttribute("onclick", "verElemento(event);");
        }
    }
    if(elemento.entidades!=null){
        let part2 = document.createElement("p");
        part2.innerHTML = "Entidades participantes:";
        div.appendChild(part2);
        for(entidad of elemento.entidades){
            let entidadhtml = document.createElement("a");
            div.appendChild(entidadhtml);
            entidadhtml.innerHTML = entidad;
            entidadhtml.setAttribute("class", "enlace");
            entidadhtml.setAttribute("href", "./verElemento.html");
            entidadhtml.setAttribute("data-tipoelemento", "entidad");
            entidadhtml.setAttribute("onclick", "verElemento(event);");
        }
    } 
}

function cargarPagCreacion(){
    let div = document.getElementById("contenedorFormulario");
    let tipoElemento = window.localStorage.getItem("tipoElemento");
    let formulario = document.createElement("form");
    formulario.setAttribute("onsubmit", "crearElemento(event, this);");
    formulario.setAttribute("id", "formularioEdicion");
    let titulo = document.createElement("h3");
    titulo.setAttribute("class", "text-center");
    div.appendChild(titulo);
    crearInput(formulario, "name", "Nombre", "text");
    crearInput(formulario, "birthDate", "Fecha nacimiento", "date");
    crearInput(formulario, "deathDate", "Fecha defunción", "date");
    crearInput(formulario, "imageUrl", "Link imagen", "url");
    crearInput(formulario, "wikiUrl", "Link wiki", "url");
    switch(tipoElemento){
        case "producto":
            titulo.innerHTML = "Crear producto";
            mostrarPersonas(formulario);
            mostrarEntidades(formulario);
            break;
        case "entidad":
            titulo.innerHTML = "Crear Entidad";
            mostrarPersonas(formulario);
            break;
        case "persona":
            titulo.innerHTML = "Crear persona";
            break;
    }
    formulario.innerHTML += "<br>";
    crearBotonesFormulario(formulario);
    div.appendChild(formulario);
    let editar = window.localStorage.getItem("editar");
    if(editar){
        editarElemento();
    }
}

function crearInput(div, id, nombre, tipo){
    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.setAttribute("class", "form-label");
    label.innerHTML = nombre;
    div.appendChild(label);
    let input = document.createElement("input");
    input.setAttribute("type", tipo);
    input.setAttribute("id", id);
    input.setAttribute("name", id);
    input.setAttribute("class", "form-control");
    div.appendChild(input);
}

function crearBotonesFormulario(formulario){
    let div = document.createElement("div");
    div.setAttribute("class", "text-center");
    formulario.appendChild(div);
    let reset = document.createElement("input");
    reset.setAttribute("type", "reset");
    reset.setAttribute("id", "reiniciarElemento");
    reset.setAttribute("name", "reiniciarElemento");
    reset.setAttribute("value", "Reiniciar");
    reset.setAttribute("class", "btn btn-secondary");
    div.appendChild(reset);
    let submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("id", "submitElemento");
    submit.setAttribute("name", "submitElemento");
    submit.setAttribute("value", "Crear");
    submit.setAttribute("class", "btn btn-secondary");
    div.appendChild(submit);
}

function mostrarPersonas(div){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let label = document.createElement("label");
    label.setAttribute("for", "personas");
    label.setAttribute("class", "form-label");
    label.innerHTML = "Personas participantes"
    div.appendChild(label);
    let select = document.createElement("select");
    select.setAttribute("id", "personas");
    select.setAttribute("name", "personas");
    select.setAttribute("class", "form-select");
    div.appendChild(select);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", "null");
    opcion.innerHTML = "Ninguno";
    select.appendChild(opcion);
    for(persona of datos.personas){
        opcion = document.createElement("option");
        opcion.setAttribute("value", persona.nombre);
        opcion.innerHTML = persona.nombre;
        select.appendChild(opcion);
    }
}

function mostrarEntidades(div){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let label = document.createElement("label");
    label.setAttribute("for", "entidades");
    label.setAttribute("class", "form-label");
    label.innerHTML = "Entidades participantes"
    div.appendChild(label);
    let select = document.createElement("select");
    select.setAttribute("id", "entidades");
    select.setAttribute("name", "entidades");
    select.setAttribute("class", "form-select");
    div.appendChild(select);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", "null");
    opcion.innerHTML = "Ninguno";
    select.appendChild(opcion);
    for(entidad of datos.entidades){
        opcion = document.createElement("option");
        opcion.setAttribute("value", entidad.nombre);
        opcion.innerHTML = entidad.nombre;
        select.appendChild(opcion);
    }
}

// Modificaciones por parte del usuario

function eliminarElemento(event){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let padre = event.target.parentNode.parentNode;
    let tipoElemento = null;
    if(document.URL.includes("/inicio.html")){
        tipoElemento = padre.parentNode.id;
    }
    else{
        tipoElemento = window.localStorage.getItem("tipoElemento");
    }
    let nombre = padre.firstElementChild.firstElementChild.innerHTML;
    if(tipoElemento==="divPer" || tipoElemento=="persona"){
        datos = eliminarProductosRelacionadosAPersona(nombre, datos);
        datos = eliminarEntidadesRelacionadas(nombre, datos);
        let index = datos.personas.map(function(x){return x.nombre}).indexOf(nombre);
        datos.personas.splice(index, 1);
    }
    else if(tipoElemento==="divProd" || tipoElemento=="producto"){
        let index = datos.productos.map(function(x){return x.nombre}).indexOf(nombre);
        datos.productos.splice(index, 1);
    }
    else{
        datos = eliminarProductosRelacionadosAEntidad(nombre, datos);
        let index = datos.entidades.map(function(x){return x.nombre}).indexOf(nombre);
        datos.entidades.splice(index, 1);
    }
    padre.remove();
    window.localStorage.setItem("datos", JSON.stringify(datos)); 
}

function eliminarEntidadesRelacionadas(nombre, datos){
    for(entidad of datos.entidades){
        if(entidad.personas)
            for(persona of entidad.personas){
                if(persona === nombre){
                    let index = datos.entidades.map(function(x){return x.nombre}).indexOf(entidad.nombre);
                    datos.entidades.splice(index, 1);
                }
            }
    }
    return datos;
}

function eliminarProductosRelacionadosAPersona(nombre, datos){
    for(producto of datos.productos){
        if(producto.personas)
            for(persona of producto.personas){
                if(persona === nombre){
                    let index = datos.productos.map(function(x){return x.nombre}).indexOf(producto.nombre);
                    datos.productos.splice(index, 1);
                }
            }
    }
    return datos;
}

function eliminarProductosRelacionadosAEntidad(nombre, datos){
    for(producto of datos.productos){
        if(producto.entidades)
            for(entidad of producto.entidades){
                if(entidad === nombre){
                    let index = datos.productos.map(function(x){return x.nombre}).indexOf(producto.nombre);
                    datos.productos.splice(index, 1);
                }
            }
    }
    return datos;
}

function crearElemento(event, formulario){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let nombreAnterior = window.localStorage.getItem("nombreElemento");
    let tipoElemento = window.localStorage.getItem("tipoElemento");
    let editar = window.localStorage.getItem("editar");
    let elemento = {
        "nombre": formulario.nombre.value,
        "fechaI": formulario.fechai.value,
        "fechaF": formulario.fechaf.value,
        "img": formulario.linkimg.value,
        "wiki": formulario.linkwiki.value
    };
    if(editar){
        datos = borrarAnterior(nombreAnterior, tipoElemento);
        window.localStorage.setItem("nombreElemento", elemento.nombre);
        window.localStorage.setItem("tipoElemento", tipoElemento);
    }
    switch(tipoElemento){
        case "persona":
            datos.personas.push(elemento);
            break;
        case "producto":
            elemento.personas = [formulario.personas.value];
            elemento.entidades = [formulario.entidades.value];
            datos.productos.push(elemento);
            break;
        case "entidad":
            elemento.personas = [formulario.personas];
            datos.entidades.push(elemento);
            break;
    }
    window.localStorage.setItem("datos", JSON.stringify(datos)); 
}

function borrarAnterior(nombreElemento, tipoElemento){
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let index = null;
    switch(tipoElemento){
        case "persona":
            index = datos.personas.map(function(x){return x.nombre}).indexOf(nombreElemento);
            datos.personas.splice(index, 1);
            break;
        case "producto":
            index = datos.productos.map(function(x){return x.nombre}).indexOf(nombreElemento);
            datos.productos.splice(index, 1);
            break;
        case "entidad":
            index = datos.entidades.map(function(x){return x.nombre}).indexOf(nombreElemento);
            datos.entidades.splice(index, 1);
            break;
    }
    return datos;
}


function borrarLogin(){
    window.localStorage.removeItem("login");
}

function setEditar(event){
    window.localStorage.setItem("editar", "true");
    if(document.URL.includes("/inicio.html")){
        let padre = event.target.parentNode.parentNode;
        let nombreElemento = padre.firstElementChild.firstElementChild.innerHTML;
        let div = padre.parentNode.id;
        let tipoElemento = null;
        switch(div){
            case "divPer":
                tipoElemento = "persona";
                break;
            case "divProd":
                tipoElemento = "producto";
                break;
            case "divEnt":
                tipoElemento = "entidad";
                break;
        }
        window.localStorage.setItem("nombreElemento", nombreElemento);
        window.localStorage.setItem("tipoElemento", tipoElemento);
    }
}

function elementoACrear(tipo){
    window.localStorage.setItem("tipoElemento", tipo);
}

function editarElemento(){
    let tipoElemento = window.localStorage.getItem("tipoElemento");
    let nombreElemento = window.localStorage.getItem("nombreElemento");
    let datos = JSON.parse(window.localStorage.getItem("datos"));
    let formulario = document.getElementById("formularioEdicion");
    formulario.parentElement.firstElementChild.innerHTML = "Editar '" + nombreElemento + "'";
    let elemento = null;
    switch(tipoElemento){
        case "persona":
            elemento = datos.personas.find(x => x.nombre === nombreElemento);
            break;
        case "producto":
            elemento = datos.productos.find(x => x.nombre === nombreElemento);
            break;
        case "entidad":
            elemento = datos.entidades.find(x => x.nombre === nombreElemento);
            break;
    }
    let inputs = formulario.getElementsByTagName("input");
    let i = 0;
    for(campo in elemento){
        if(i<inputs.length && i<5){
            inputs[i].setAttribute("value", elemento[campo]);
        }
        i++;
    }
    botonActualizar = document.getElementById("submitElemento");
    botonActualizar.setAttribute("value", "Actualizar");
    botonActualizar.setAttribute("onclick", "borrarAnterior(event)");
    window.localStorage.setItem("datos", JSON.stringify(datos));
}