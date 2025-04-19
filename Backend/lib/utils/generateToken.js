import jwt from 'jsonwebtoken'

export const generateToken = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn: '5d'
  })

  res.cookie("Token", token, {
    maxAge : 3600 * 15 * 24 * 1000,
    httpOnly: true,
    sameSite : "none" 
  })

}
