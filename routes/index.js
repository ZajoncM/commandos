var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Point = require('../models/Point');
var { nanoid } = require("nanoid");
const sequelize = require('../database');
const { QueryTypes } = require('sequelize');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET group page. */
router.get('/setGroup/:group', async (req, res, next) => {
  const {group} = req.params;

  try {

  if(req.cookies.id) {
    const user = await User.findOne({
      where:{
        id: req.cookies.id
      }
    });

    if (user) {
      throw `Jesteś już w grupie ${user.group}`;
    }

    await User.create({id: req.cookies.id, group: parseInt(group)})
    res.cookie('id', req.cookies.id); 
    res.render('newGroup', { title: `Cześć! Jesteś w grupie ${group}`, message: `` });
  } else {

    const id = nanoid();
    await User.create({id, group: parseInt(group)})
    res.cookie('id', id); 
    res.render('newGroup', { title: `Cześć! Jesteś w grupie ${group}`, message: `` });
  }
    
  } catch (error) {
    res.render('error', { message: error});
  }
});

router.get('/getPoint/:base', async (req, res, next) => {
  const {base} = req.params;
  const id = parseInt(Buffer.from(base, 'base64').toString('ascii'))
  const session = req.cookies.id;

  try {

   
    const groupPoints = await sequelize.query(`
    SELECT 
      users.[group], 
      COUNT(points.number) AS points 
    FROM users 
    JOIN points ON users.id = points.userId
    GROUP BY users.[group]
    `,{type: QueryTypes.SELECT});
    
    groupPoints.forEach(({group,points}) => {
      if (points >= 10) {
        throw `Koniec gry!! Drużyna ${group} zdobyła wszystkie punkty 🏆`;
      }
    })
    
    if(!session) {
      throw 'Brak sesji';
    }

    if(isNaN(id)) {
      throw 'Niepoprawny punkt';
    }

    const user = await User.findOne({
      where:{
        id: session
      }
    });

    if(!user) {
      throw 'Nie ma takiego użytkownika';
    }

    
    const users = await User.findAll({
      where: {
        group: user.group
      }
    });

    const groupIds = users.map(u => u.id)

    const points = await Point.findAll({
      where: {
        userId: groupIds
      }
    });

    const pointIds = points.map(p => p.number);

    if(pointIds.includes(parseInt(id))) {
      throw 'Twoja grupa zdobyła już ten punkt';
    }

    await Point.create({number: id, userId: user.id})


    res.render('newGroup', { title: `Zdobyłeś punkt ${id}` });
  } catch (error) {
    res.render('error', { message: error});
  }
});

router.get('/stats', async (req, res, next) => {
  const users = await User.findAll();
  const points = await Point.findAll();

  users.sort((x, y) => x.group - y.group);

  res.render('stats', { title: 'Statystyki', users, points });
});

router.get('/resetGame', async (req, res, next) => {
  await User.destroy({
    truncate: true
  });

  await Point.destroy({
    truncate: true
  });

  res.render('error', { message: 'Zresetowano system'});
});

module.exports = router;
