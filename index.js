const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')

const path = require('path');

const app = express();

const Posts = require('./Posts.js')

var session = require('express-session')

mongoose.connect('mongodb+srv://root:qKStxdHRvwKC4WPK@cluster0.nzxhi.mongodb.net/dankicode?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('conectado com sucesso')
}).catch((err)=>{
    console.log(err.message)
})

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(session({
    secret: 'keyboard cat',
    cookie: {maxAge: 60000}
  }))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err, posts){
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                 postsTop = postsTop.map(function(val){

                         return {

                             titulo: val.titulo,

                             conteudo: val.conteudo,

                             descricaoCurta: val.conteudo.substr(0,100),

                             imagem: val.imagem,

                             slug: val.slug,

                             categoria: val.categoria,

                             views: val.views

                             

                         }

                 })  



                 res.render('home',{posts:posts,postsTop:postsTop});

                

             })

        })
        
    }else{

        Posts.find({titulo: {$regex: req.query.busca, $options: "i"}}, (err, posts)=>{
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            }),
            res.render('busca',{posts, contagem:posts.length});
        })

        
    }

  
});


app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug:req.params.slug}, {$inc: {views: 1}}, {new: true}, function (err,resposta){
        //console.log(resposta)
        if(resposta != null){
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                postsTop = postsTop.map(function(val){

                        return {

                            titulo: val.titulo,

                            conteudo: val.conteudo,

                            descricaoCurta: val.conteudo.substr(0,100),

                            imagem: val.imagem,

                            slug: val.slug,

                            categoria: val.categoria,

                            views: val.views

                            

                        }

                })  



                res.render('single',{noticia:resposta,postsTop:postsTop});

               

            })
        }



    })
})

var usuarios = [
    {
        login: 'Jonas',
        senha: '123456'
    }
]

app.post('/admin/login', (req, res) => {
    usuarios.map(function(val) {
        if(val.login == req.body.login && val.senha == req.body.senha) {
            req.session.login = 'Jonas';
        }
    })
    res.redirect('/admin/login');
})

app.post('/admin/cadastro', (req,res)=>{
    console.log(req.body)
    Posts.create({
        titulo: req.body.titulo_noticia,
        imagem: req.body.url_imagem,
        categoria: 'Nenhuma',
        conteudo: req.body.noticia,
        slug: req.body.slug,
        autor: "Admin",
        views: 0
    })
    res.redirect("/admin/login");
})

app.get('/admin/deletar/:id', (req,res)=>{
    Posts.deleteOne({_id:req.params.id}).then(function(){
        res.redirect('/admin/login')
    })
    
})

app.get('/admin/login', (req,res) => {
    if(req.session.login == null) {
        res.render('admin-login');
    } else {
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){

            posts = posts.map(function(val){

                    return {
                        id: val._id,

                        titulo: val.titulo,

                        conteudo: val.conteudo,

                        descricaoCurta: val.conteudo.substr(0,100),

                        imagem: val.imagem,

                        slug: val.slug,

                        categoria: val.categoria,

                        views: val.views

                        

                    }

            })  



            res.render('admin-panel',{posts:posts});

           console.log(posts)

        })
    }
    
})

app.listen(5000,()=>{
    console.log('server rodando!');
})