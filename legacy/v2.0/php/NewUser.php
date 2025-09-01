<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");

   if ( !only_alphanumeric($user_id) ) $user_id="";
   if ( !only_alphanumeric($password1) ) $password1="";
   if ( !only_alphanumeric($password2) ) $password2="";
   if ( !check_email($email) ) $email="";
   if ( !only_alphanumeric($forname) ) $forname="";
   if ( !only_alphanumeric($surname) ) $surname="";
   if ( !only_alphanumeric($zip) ) $zip="";
   if ( !is_numeric($age) ) $age=1;
   if ( !is_numeric($gender) ) $gender=1;

   include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>
<body>
<table width="100%" align="center" border="0">
  <tr>
    <td colspan="2">
<?php
  include "../utils/title.php";
?>
    </td>
  </tr>
</table>
    
<form action=Submit_AddUser.php method=post>
<table width="100%" align="center" border="0">
 <tr>
 <td rowspan="7" valign="top" colspan="2" align="center"> 
        
  <table border=0 cellpadding=4 cellspacing=0 align="center">
  <tr> 
   <td colspan=2 height="30"> 
    <center>Please Enter Your Preferred User ID and Password</center>
   </td>
  </tr>
          
  <tr align=middle> 
   <td align=left width=109 height="43">*User ID</td>
   <td align=left width=270 height="43"> 
              
<?php
print "<input maxlength=63 name=user_id value='$user_id' size=25>  (alphanumerics only eg. fredsmith)";
?>
   </td>
  </tr>          

  <tr align=middle> 
   <td align=left width=109 height="43">*Password</td>
   <td align=left width=270 height="43"> 
<?php
print "<input type=password maxlength=63 name=password1 value='$password1' size=25> (try to use combination of letters and numbers)";
?>
   </td>
  </tr>

  <tr align=middle> 
   <td align=left width=109 height="43">*ReEnter Password</td>
   <td align=left width=270 height="43"> 
<?php
print "<input type=password maxlength=63 name=password2 value='$password2' size=25>";
?>
   </td>
  </tr>
          
  <tr align=center > 
   <td colspan="2" height="12">Please Enter Your Contact Information</b></big></td>
  </tr>

  <tr align=middle> 
   <td align=left width=109 height="38">*Email <br> </td>
   <td align=left width=270 height="38"> 
<?php
print "<input maxlength=63 name=email value='$email' size=25>";
?>
   </td>            
  </tr>

  <tr align=middle> 
   <td align=left width=109 height="37">*Forename<br></td>
   <td align=left width=270 height="37"> 
<?php
print "<input maxlength=63 name=forename value='$forename' size=25>"; 
?>
   </td>
  </tr>

  <tr align=middle> 
   <td align=left width=109 height="37">*Surname<br>
   <td align=left width=270 height="37"> 
<?php
print "<input maxlength=63 name=surname value='$surname' size=25>"; 
?>
   </td>
  </tr>
          
  <tr align=middle> 
   <td align=left width=164>Age</td>
   <td align=left width=411> 
    <select name=age>
<?php
 $age_ranges = array ("","Select an age range", "18-24", "25-34", "35-50", "51-65", "over 65" );

 if ( !isset($age) )
   $age=1;

 for ($i=1;$i<count($age_ranges);$i++)
 {
   if ($i == $age)
     print "<option value=".$i." selected>$age_ranges[$i]";
   else
     print "<option value=".$i.">$age_ranges[$i]";
 }
?>
    </select>
   </td>
  </tr>
        
  <tr align=middle> 
   <td align=left width=164>Gender</td>
   <td align=left width=411> 
    <select name=gender>
<?php
 $gender_ranges = array ("","Unspecified", "Male", "Female");

 if ( !isset($gender) )
   $gender=1;

 for ($i=1;$i<count($gender_ranges);$i++)
 {
   if ($i == $gender)
     print "<option value=".$i." selected>$gender_ranges[$i]";
   else
     print "<option value=".$i.">$gender_ranges[$i]";
 }
?>
    </select>
   </td>
  </tr>
      
 </table>
<INPUT TYPE="submit" value="Add this new user">
<p>If you have any problems registering, contact us at support@yearaway.com.</p>
<p>* required information</p>
</td>
</tr>
  
</table>

</form>
</body>
</html>
