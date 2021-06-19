let logeado = JSON.parse(window.localStorage.getItem("login"));

function cargarPrincipal(){
    window.localStorage.removeItem("elementType");
    window.localStorage.removeItem("elementId");
    window.localStorage.removeItem("editar");
    window.localStorage.removeItem("E-tag");
    let logeado = JSON.parse(window.localStorage.getItem("login"));
    if(logeado){
        mostrarReader();
        if(esWriter(logeado))
            mostrarWriter();
    }
    else{
        ocultarWriter();
        ocultarReader();
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
            let usrname = document.getElementById("form-login").username.value;
            // => show scopes, users, products, ...
            authHeader = request.getResponseHeader('Authorization');
            window.localStorage.setItem("login", JSON.stringify(authHeader)); 
            window.localStorage.setItem("usrname", usrname); 
            mostrarReader();
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
    ocultarReader();
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
    div.appendChild(formulario);
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

function ocultarReader(){
    window.localStorage.removeItem("usrname");
    let botonLogout = document.getElementById("logout");
    if(botonLogout)
        botonLogout.remove();
    let htmlusername = document.getElementById("htmlusername");
    if(htmlusername)
        htmlusername.remove();
    if(document.URL.includes("/inicio.html")){
        ocultarContenido();
    }
    crearFormularioLogin();
}

function ocultarWriter(){
    if(document.URL.includes("/inicio.html")){
        let registro = document.getElementById("registro");
        if(registro)
            registro.remove();
    }
    let botones = document.getElementsByClassName("btn btn-secondary");
    for(b of botones){
        b.style.display = "none";
    }
}

function mostrarReader(){
    let form = document.getElementById("form-login");
    if(form)
        form.remove();
    let div = document.getElementById("contenedorLogin").firstElementChild;
    let htmlusername = document.createElement("p");
    let usrname = window.localStorage.getItem("usrname");
    htmlusername.innerHTML = "Usuario:  " + usrname;
    htmlusername.setAttribute("id", "htmlusername");
    div.appendChild(htmlusername);
    if(document.URL.includes("/inicio.html")){
        cargarPersonas(logeado);
        cargarProductos(logeado);
        cargarEntidades(logeado);
    }
    crearBotonLogout();
}

function mostrarWriter(){
    /*let registro = document.getElementById("registro");
    if(registro)
        registro.remove();*/
    if(document.URL.includes("/inicio.html")){
        crearBotonRegistro();
        crearBotonGestionUsuarios();
    }
    let botones = document.getElementsByClassName("btn btn-secondary");
    for(b of botones){
        b.style.display = "block";
    }
}

function ocultarContenido(){
    let persons = document.getElementById("divPer");
    let products = document.getElementById("divProd");
    let entities = document.getElementById("divEnt");
    while (persons.firstChild){    
        persons.removeChild(persons.firstChild);
    }
    while (products.firstChild){    
        products.removeChild(products.firstChild);
    }
    while (entities.firstChild){    
        entities.removeChild(entities.firstChild);
    }
}

function elementoACrear(tipo){
    window.localStorage.setItem("elementType", tipo);
}

function borrarLogin(){
    window.localStorage.removeItem("login");
}

//  Carga elementos

function cargarPersonas(authHeader){
    $.ajax({
        type: "GET",
        url: "/api/v1/persons",
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            let div = document.getElementById("divPer");
            for(person of data.persons){
                cargarElementoBasico(div, person.person, "persons");
                div.innerHTML += "<br>";
            }
        }
    })
}

function cargarProductos(authHeader){
    $.ajax({
        type: "GET",
        url: "/api/v1/products",
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            let div = document.getElementById("divProd");
            for(product of data.products){
                cargarElementoBasico(div, product.product, "products");
                div.innerHTML += "<br>";
            }
        }
    })
}

function cargarEntidades(authHeader){
    $.ajax({
        type: "GET",
        url: "/api/v1/entities",
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            let div = document.getElementById("divEnt");
            for(entity of data.entities){
                cargarElementoBasico(div, entity.entity, "entities");
                div.innerHTML += "<br>";
            }
        }
    })
}

function cargarElementoBasico(div, elemento, tipo){
    let contenedor = document.createElement("div");
    contenedor.setAttribute("class", "card");
    div.appendChild(contenedor);
    let contenido = document.createElement("div");
    contenido.setAttribute("class", "card-body text-center");
    contenido.setAttribute("data-id", elemento.id);
    contenido.setAttribute("data-type", tipo);
    contenedor.appendChild(contenido);
    let nombre = document.createElement("a");
    nombre.setAttribute("class", "nombreElemento");
    nombre.setAttribute("href", "./verElemento.html");
    nombre.setAttribute("onclick", "verElemento(event);");
    nombre.innerHTML = elemento.name;
    contenido.appendChild(nombre);
    let img = document.createElement("img");
    img.setAttribute("src", elemento.imageUrl);
    img.setAttribute("width", "50");
    img.setAttribute("heigth", "50");
    contenido.appendChild(img);
    crearBotones(contenedor);
}

function cargarDatosComunes(div, elemento, elementType){
    let item = document.createElement("div");
    item.setAttribute("class", "card");
    div.appendChild(item);
    let body = document.createElement("div");
    body.setAttribute("class", "card-body text-center");
    body.setAttribute("data-id", elemento.id);
    body.setAttribute("data-type", elementType);
    item.appendChild(body);
    let nombre = document.createElement("h3");
    nombre.setAttribute("class", "text-center");
    body.appendChild(nombre);
    nombre.innerHTML = elemento.name;
    body.innerHTML += "<br>";
    let fechaI = document.createElement("p");
    fechaI.innerHTML = "Fecha nacimiento: " + elemento.birthDate;
    body.appendChild(fechaI);
    let fechaF = document.createElement("p");
    fechaF.innerHTML = "Fecha defunción: " + elemento.deathDate;
    body.appendChild(fechaF);
    let img = document.createElement("img");
    img.setAttribute("id","imagen");
    img.setAttribute("src", elemento.imageUrl);
    img.setAttribute("width", "100");
    img.setAttribute("heigth", "100");
    body.appendChild(img);
    body.innerHTML += "<br>";
    let link = document.createElement("a");
    link.setAttribute("href", elemento.wikiUrl);
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
    window.localStorage.setItem("elementId", event.target.parentNode.getAttribute("data-id"));
    window.localStorage.setItem("elementType", event.target.parentNode.getAttribute("data-type"));
}

function verElementoEnlazado(event){
    window.localStorage.setItem("elementId", event.target.getAttribute("data-id"));
    window.localStorage.setItem("elementType", event.target.getAttribute("data-type"));
}

function cargarPagDetalles(){
    let logeado = JSON.parse(window.localStorage.getItem("login"));
    if(logeado){
        mostrarReader();
        mostrarWriter();
        cargarElementoDetalles(logeado);
    }
    else{
        ocultarReader();
        ocultarWriter();
    }
}

function cargarElementoDetalles(authHeader){
    let elementId = window.localStorage.getItem("elementId");
    let elementType = window.localStorage.getItem("elementType");
    let div = document.getElementById("elemento");
    $.ajax({
        type: "GET",
        url: '/api/v1/' + elementType + '/' + elementId,
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            cargarDatosComunes(div, data[Object.keys(data)[0]], elementType);
            cargarRelaciones(div.firstElementChild.firstElementChild, data[Object.keys(data)[0]], authHeader);
        }
    })
}

function cargarRelaciones(div, element, authHeader){
    cargarPersonasRelacionadas(div, element, authHeader);
    cargarProductosRelacionados(div, element, authHeader);
    cargarEntidadesRelacionadas(div, element, authHeader);
}

function cargarPersonasRelacionadas(div, element, authHeader){
    if(element.persons!=null){
        let texto = document.createElement("p");
        div.appendChild(texto);
        texto.innerHTML = "Personas participantes:";
        for(person of element.persons){
            $.ajax({
                type: "GET",
                url: '/api/v1/persons/' + person,
                headers: {"Authorization": authHeader},
                // dataType: 'json',
                success: function (data) {
                    personahtml.innerHTML = data.person.name;
                    personahtml.setAttribute("data-id", data.person.id);
                }
            })
            let personahtml = document.createElement("a");
            div.appendChild(personahtml);
            personahtml.setAttribute("class", "enlace");
            personahtml.setAttribute("href", "./verElemento.html");
            personahtml.setAttribute("data-type", "persons");
            personahtml.setAttribute("onclick", "verElementoEnlazado(event);");
        }
    }
}

function cargarProductosRelacionados(div, element, authHeader){
    if(element.products!=null){
        let texto = document.createElement("p");
        texto.innerHTML = "Productos relacionados:";
        div.appendChild(texto);
        for(product of element.products){
            $.ajax({
                type: "GET",
                url: '/api/v1/products/' + product,
                headers: {"Authorization": authHeader},
                // dataType: 'json',
                success: function (data) {
                    productohtml.innerHTML = data.product.name;
                    productohtml.setAttribute("data-id", data.product.id);
                }
            })
            let productohtml = document.createElement("a");
            div.appendChild(productohtml);
            productohtml.setAttribute("class", "enlace");
            productohtml.setAttribute("href", "./verElemento.html");
            productohtml.setAttribute("data-type", "products");
            productohtml.setAttribute("onclick", "verElementoEnlazado(event);");
        }
    } 
}

function cargarEntidadesRelacionadas(div, element, authHeader){
    if(element.entities!=null){
        let texto = document.createElement("p");
        texto.innerHTML = "Entidades participantes:";
        div.appendChild(texto);
        for(entity of element.entities){
            $.ajax({
                type: "GET",
                url: '/api/v1/entities/' + entity,
                headers: {"Authorization": authHeader},
                // dataType: 'json',
                success: function (data) {
                    entidadhtml.innerHTML = data.entity.name;
                    entidadhtml.setAttribute("data-id", data.entity.id);
                }
            })
            let entidadhtml = document.createElement("a");
            div.appendChild(entidadhtml);
            entidadhtml.setAttribute("class", "enlace");
            entidadhtml.setAttribute("href", "./verElemento.html");
            entidadhtml.setAttribute("data-type", "entities");
            entidadhtml.setAttribute("onclick", "verElementoEnlazado(event);");
        }
    }
}

function cargarPagCreacion(){
    let div = document.getElementById("contenedorFormulario");
    let tipoElemento = window.localStorage.getItem("elementType");
    let formulario = document.createElement("form");
    formulario.setAttribute("id", "formularioEdicion");
    formulario.setAttribute("method", "POST");
    let titulo = document.createElement("h3");
    titulo.setAttribute("class", "text-center");
    div.appendChild(titulo);
    let divInputs = document.createElement("div");
    divInputs.setAttribute("id", "divInputs");
    formulario.appendChild(divInputs);
    let divBotones = document.createElement("div");
    divBotones.setAttribute("class", "text-center");
    formulario.appendChild(divBotones);
    crearBotonesFormulario(divBotones);
    crearInput(divInputs, "name", "Nombre", "text");
    crearInput(divInputs, "birthDate", "Fecha nacimiento", "date");
    crearInput(divInputs, "deathDate", "Fecha defunción", "date");
    crearInput(divInputs, "imageUrl", "Link imagen", "url");
    crearInput(divInputs, "wikiUrl", "Link wiki", "url");
    switch(tipoElemento){
        case "products":
            titulo.innerHTML = "Crear producto";
            mostrarPersonas(divInputs);
            mostrarEntidades(divInputs);
            break;
        case "entities":
            titulo.innerHTML = "Crear entidad";
            mostrarPersonas(divInputs);
            mostrarProductos(divInputs);
            break;
        case "persons":
            titulo.innerHTML = "Crear persona";
            mostrarProductos(divInputs);
            mostrarEntidades(divInputs);
            break;
    }
    div.appendChild(formulario);
    let editar = window.localStorage.getItem("editar");
    if(editar){
        editarElemento();
    }
    else{
        formulario.setAttribute("onsubmit", "crearElemento(event, this);");
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
    formulario.innerHTML += "<br>";
    let reset = document.createElement("input");
    reset.setAttribute("type", "reset");
    reset.setAttribute("id", "reiniciarElemento");
    reset.setAttribute("value", "Reiniciar");
    reset.setAttribute("class", "btn btn-secondary");
    formulario.appendChild(reset);
    let submit = document.createElement("input");
    submit.setAttribute("type", "submit");
    submit.setAttribute("id", "submitElemento");
    submit.setAttribute("value", "Crear");
    submit.setAttribute("class", "btn btn-secondary");
    formulario.appendChild(submit);
}

// Modificaciones por parte del usuario

function eliminarElemento(event){
    event.preventDefault();
    let padre = event.target.parentNode.parentNode;
    let idElement = padre.firstElementChild.getAttribute("data-id");
    let typeElement = padre.firstElementChild.getAttribute("data-type");
    $.ajax({
        type: "DELETE",
        url: '/api/v1/' + typeElement + '/' + idElement,
        headers: {"Authorization": logeado},
        // dataType: 'json',
        success: function (data) {
            //eliminar relaciones
        }
    })
    padre.remove();
}

function crearElemento(event, formulario){
    event.preventDefault();
    let logeado = JSON.parse(window.localStorage.getItem("login"));
    let tipoElemento = window.localStorage.getItem("elementType");
    let elemento = {
        "name": formulario.name.value,
        "birthDate": formulario.birthDate.value,
        "deathDate": formulario.deathDate.value,
        "imageUrl": formulario.imageUrl.value,
        "wikiUrl": formulario.wikiUrl.value,
    };
    pushElement(tipoElemento, elemento, logeado);
}

function addRelation(elementId, elementType, elementId2, elementType2, authHeader){
    $.ajax({
        type: "PUT",
        url: '/api/v1/' + elementType + '/' + elementId + '/' + elementType2 + '/add/' + elementId2,
        headers: {"Authorization": authHeader}
        // dataType: 'json',
    })
}

function pushElement(elementType, element, authHeader){
    $.ajax({
        type: "POST",
        url: '/api/v1/' + elementType,
        headers: {"Authorization": authHeader},
        data: element,
        // dataType: 'json',
        error: function (data) {
            alert("Error al crear\n" + JSON.stringify(data));
        },
        success: function(data){
            let form = document.getElementById("formularioEdicion");
            if(form.products)
                addRelation(data[Object.keys(data)[0]].id, elementType, form.products.value, 'products', authHeader);
            if(form.entities)
                addRelation(data[Object.keys(data)[0]].id, elementType, form.entities.value, 'entities', authHeader);
            if(form.persons)
                addRelation(data[Object.keys(data)[0]].id, elementType, form.persons.value, 'persons', authHeader);
        }
    })
}

function editarElemento(){
    let logeado = JSON.parse(window.localStorage.getItem("login"));
    let tipoElemento = window.localStorage.getItem("elementType");
    let idElemento = window.localStorage.getItem("elementId");
    getElementToEdit(tipoElemento, idElemento, logeado);
    botonActualizar = document.getElementById("submitElemento");
    botonActualizar.setAttribute("value", "Actualizar");
    botonActualizar.setAttribute("onclick", "updateElement(event)");
    let form = document.getElementById("formularioEdicion");
    form.setAttribute("method", "PUT");
}

function setEditar(event){
    window.localStorage.setItem("editar", "true");
    if(document.URL.includes("/inicio.html")){
        let nodo = event.target.parentNode.parentNode.firstElementChild;
        window.localStorage.setItem("elementId", nodo.getAttribute("data-id"));
        window.localStorage.setItem("elementType", nodo.getAttribute("data-type"));
    }
}

function updateElement(event){
    let formulario = document.getElementById("formularioEdicion");
    event.preventDefault();
    let authHeader = JSON.parse(window.localStorage.getItem("login"));
    let e_tag = JSON.parse(window.localStorage.getItem("E-tag"));
    let elementType = window.localStorage.getItem("elementType");
    let elementId = window.localStorage.getItem("elementId");
    let element = {
        "name": formulario.name.value,
        "birthDate": formulario.birthDate.value,
        "deathDate": formulario.deathDate.value,
        "imageUrl": formulario.imageUrl.value,
        "wikiUrl": formulario.wikiUrl.value,
    }
    //"products": formulario.products.value,
    //"entities": formulario.entities.value
    $.ajax({
        type: "PUT",
        url: '/api/v1/' + elementType + '/' + elementId,
        headers: {"Authorization": authHeader, "etag": e_tag},
        data: element,
        // dataType: 'json',
        error: function (data) {
            alert("Error al actualizar\n" + JSON.stringify(data));
        }
    })
    //set relaciones
}

function getElementToEdit(elementType, elementId, authHeader){
    let jqXHR = $.ajax({
        type: "GET",
        url: '/api/v1/' + elementType + '/' + elementId,
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            window.localStorage.setItem("E-tag", JSON.stringify(jqXHR.getResponseHeader('etag')));
            let elemento = data[Object.keys(data)[0]];
            let formulario = document.getElementById("formularioEdicion");
            formulario.parentElement.firstElementChild.innerHTML = "Editar '" + elemento.name + "'";
            document.getElementById("name").setAttribute("value", elemento.name);
            document.getElementById("birthDate").setAttribute("value", elemento.birthDate);
            document.getElementById("deathDate").setAttribute("value", elemento.deathDate);
            document.getElementById("wikiUrl").setAttribute("value", elemento.wikiUrl);
            document.getElementById("imageUrl").setAttribute("value", elemento.imageUrl);
        }
    })
}

function mostrarPersonas(div){
    let label = document.createElement("label");
    label.setAttribute("for", "persons");
    label.setAttribute("class", "form-label");
    label.innerHTML = "Personas participantes";
    div.appendChild(label);
    let select = document.createElement("select");
    select.setAttribute("id", "persons");
    select.setAttribute("class", "form-select");
    div.appendChild(select);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", "null");
    opcion.innerHTML = "Ninguno";
    select.appendChild(opcion);
    colocarPersonasRelacionadas(select);
}

function colocarPersonasRelacionadas(div){
    let authHeader = JSON.parse(window.localStorage.getItem("login"));
    $.ajax({
        type: "GET",
        url: '/api/v1/persons',
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            for(person of data.persons){
                opcion = document.createElement("option");
                opcion.setAttribute("value", person.person.id);
                opcion.innerHTML = person.person.name;
                div.appendChild(opcion);
            }
        }
    })
}

function mostrarEntidades(div){
    let label = document.createElement("label");
    label.setAttribute("for", "entities");
    label.setAttribute("class", "form-label");
    label.innerHTML = "Entidades participantes";
    div.appendChild(label);
    let select = document.createElement("select");
    select.setAttribute("id", "entities");
    select.setAttribute("class", "form-select");
    div.appendChild(select);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", "null");
    opcion.innerHTML = "Ninguno";
    select.appendChild(opcion);
    colocarEntidadesRelacionadas(select);
}

function colocarEntidadesRelacionadas(div){
    let authHeader = JSON.parse(window.localStorage.getItem("login"));
    $.ajax({
        type: "GET",
        url: '/api/v1/entities',
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            for(entity of data.entities){
                opcion = document.createElement("option");
                opcion.setAttribute("value", entity.entity.id);
                opcion.innerHTML = entity.entity.name;
                div.appendChild(opcion);
            }
        }
    })
}

function mostrarProductos(div){
    let label = document.createElement("label");
    label.setAttribute("for", "products");
    label.setAttribute("class", "form-label");
    label.innerHTML = "Productos participantes";
    div.appendChild(label);
    let select = document.createElement("select");
    select.setAttribute("id", "products");
    select.setAttribute("class", "form-select");
    div.appendChild(select);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", "null");
    opcion.innerHTML = "Ninguno";
    select.appendChild(opcion);
    colocarProductosRelacionados(select);
}

function colocarProductosRelacionados(div){
    let authHeader = JSON.parse(window.localStorage.getItem("login"));
    $.ajax({
        type: "GET",
        url: '/api/v1/products',
        headers: {"Authorization": authHeader},
        // dataType: 'json',
        success: function (data) {
            for(product of data.products){
                opcion = document.createElement("option");
                opcion.setAttribute("value", product.product.id);
                opcion.innerHTML = product.product.name;
                div.appendChild(opcion);
            }
        }
    })
}

function createUser(event){
    event.preventDefault();
    let authHeader = JSON.parse(window.localStorage.getItem("login"));
    let form = document.getElementById("registerForm");
    if(form.password.value === form.pwdconfirmation.value){
        let user = {
            "username": form.username.value,
            "email": form.email.value,
            "password": form.password.value,
            "role": form.role.value
        }
        $.ajax({
            type: "POST",
            url: '/api/v1/users',
            headers: {"Authorization": authHeader},
            data: user
        })
    }
    else{
        alert("Las contraseñas no coinciden");
    }
}

//funcionalidad usuarios

function crearBotonRegistro(){
    let div = document.getElementById("usuarios")
    let registro = document.createElement("a");
    registro.setAttribute("id", "registro");
    registro.setAttribute("class", "btn btn-secondary");
    registro.setAttribute("href", "./registro.html");
    registro.innerHTML = "Crear usuario";
    div.appendChild(registro);
}

function crearBotonGestionUsuarios(){
    let div = document.getElementById("usuarios")
    let gestion = document.createElement("a");
    gestion.setAttribute("id", "registro");
    gestion.setAttribute("class", "btn btn-secondary");
    gestion.setAttribute("href", "./gestionUsuarios.html");
    gestion.innerHTML = "Gestionar usuarios";
    div.appendChild(gestion);
}

function loadUsers(){
    let logeado = JSON.parse(window.localStorage.getItem("login"));
    if(logeado){
        mostrarReader();
        mostrarWriter();
    }
    else{
        ocultarReader();
        ocultarWriter();
    }
    let div = document.getElementById("users");
    $.ajax({
        type: "GET",
        url: '/api/v1/users',
        headers: {"Authorization": logeado},
        // dataType: 'json',
        success: function (data) {
            for(user in data.users){
                showUser(div, data.users[user].user);
                div.innerHTML += "<br>";
            }
        }
    })
}

function showUser(div, user){
    let contenedor = document.createElement("div");
    contenedor.setAttribute("class", "card");
    div.appendChild(contenedor);
    let contenido = document.createElement("div");
    contenido.setAttribute("class", "card-body text-center");
    contenido.setAttribute("data-id", user.id);
    contenido.setAttribute("data-type", "users");
    contenedor.appendChild(contenido);
    let nombre = document.createElement("p");
    nombre.innerHTML = user.username;
    contenido.appendChild(nombre);
    let email = document.createElement("p");
    email.innerHTML = user.email;
    contenido.appendChild(email);
    let role = document.createElement("p");
    role.innerHTML = user.role;
    contenido.appendChild(role);
    let botones = document.createElement("div");
    botones.setAttribute("class", "btn-group");
    botones.setAttribute("role", "group");
    botones.setAttribute("aria-label", "botones");
    contenedor.appendChild(botones);
    crearBotonEliminar(botones);
}