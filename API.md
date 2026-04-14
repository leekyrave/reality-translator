const axios = api.create('http://localhost:3000/api')

POST - /auth/register
{
email: string;
name: string;
password: string;
}

return {
success: true,
data: {}
}
set cookie automatically

POST: /auth/login
{
email: string;
password: string;
}
return {
success: true,
data: {}
}
set cookie automatically

POST: /auth/logout
delete cookie
return {
success: true or false
}


/chat/message
