module.exports = (req, res , next) => {
    if(!req.session.isLoggedIn){
        req.session.returnTo = req.originalUrl; // nhớ đường dẫn trước khi chuyển tới trang log in để sau khi log in xong thì quay lại
        return res.redirect('/login')
    }    
    next();
}