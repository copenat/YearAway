<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include_once('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once ('../class/TextParse.class');
  include_once('../class/Meta.class');
  include_once('../class/Log.class');
  $log = new Log (1);
?>
<html>
<?php
   printMeta();
?>

<body>
<form action=NewUser.php method=POST>
<table width=100% align="left" border="0">
  <tr>
    <td colspan="2">
<?php
  include_once("../utils/title.php");
?>
    </td>
  </tr>
  <tr>
  <td>
    <br>

<?php
    $ok = 1;

    $user_id    = chop ($user_id);
    $password1  = chop ($password1);
    $password2  = chop ($password2);
    $email      = chop ($email);
    $forename   = chop ($forename);
    $surname    = chop ($surname);

    /* check all fields entered */
    if ($user_id == "") 
    {
      print "<p>User Id has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }
    if ($password1 == "") 
    {
      print "<p>Password has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }
    if ($password2 == "")
    {
      print "<p>Password check has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }
    if ($email == "") 
    {
      print "<p>Email address has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }
    if ($forename == "")
    {
      print "<p>Forename has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }
    if ($surname == "")
    {
      print "<p>Surname has been left blank. Please re-edit.</p>\n";
      $ok = 0;
    }

    if ($ok)
    {
      if ($password1 != $password2)
      {
        print "<p>Passwords are not identical. Please re-edit.</p>\n";
        $ok = 0;
      }
    }

    if ($ok)
    {
      if (!only_alphanumeric($user_id))
      {
        print "<p>User name must only contain alpha-numeric characters. Please re-edit.</p>";
        $ok = 0;
      }
      if (!only_superstring($password1) || !only_superstring($password2))
      {
        print "<p>Password must only contain alpha-numeric characters. Please re-edit.</p>";
        $ok = 0;
      }
      if (!only_superstring($forename))
      {
        print "<p>Forename must only contain alpha-numeric characters. Please re-edit.</p>";
        $ok = 0;
      }
      if (!only_superstring($surname))
      {
        print "<p>Surname must only contain alpha-numeric characters. Please re-edit.</p>";
        $ok = 0;
      }
      if (!check_email($email))
      {
        print "<p>Email entered is not valid. Please re-edit.</p>";
        $ok = 0;
      }
      if (!is_numeric($age))
      {
        print "<p>Age needs to be a number. Please re-edit.</p>";
        $ok = 0;
      }
      if (!is_numeric($gender))
      {
        print "<p>An invalid value for gender has been entered. Please re-edit.</p>";
        $ok = 0;
      }

    }

    if ($ok)
    {
      ya_connect();

      /* check user is not already taken */
      $qry = "select    1
              from person
              where user_name = '$user_id'";
      $result = mysql_query($qry);
      $user_found = 0;

      if (! $result)
        $log->add($PHP_SELF.":- SQL","$qry - ".mysql_error());
      else
      {
        while ( $row = mysql_fetch_array($result))
          $user_found = 1;
      }

      if ($user_found == 1)
      {
        print "<p>Sorry, this username is already being used. Please re-edit and choose another one.</p>";
        $ok = 0;
      }
    }

    if ($ok)
    {
      /* add user */
      $qry = "insert into person
        (   user_name, password, status_id, email,
            forename, surname, ctryoforig_id,
            age, last_login, sid, gender )
        values
        ( '$user_id', password('$password1'), 1, '$email',
          '$forename', '$surname', null,
          $age, null, null, $gender
        )"; 
      $result = mysql_query($qry);

      if ($result)
      {
        $log->add($PHP_SELF.":- New user","New user ($user_id) added");
        print "User $user_id been added and is ready for use. You can log in from the homepage.";
        print "<p></p>";
        print "An email has been sent to $email confirming your details.";
        print "<p></p>";

        $message = "Dear $forename $surname,

You have registered with YearAway.com.

Your User ID is '$user_id' and password is $password1

You may now create your diaries. We hope you enjoy using our site.
    
If this email has been sent in error - please reply and let us know.
";
        mail($email, "YearAway.com Registration Confirmation", $message, "From: support@yearaway.com");
      }
      else
      {
        $log->add($PHP_SELF.":- SQL","$qry - ".mysql_error());
        $ok = 0;
        print "<p>An internal error has occurred whilst attempting to add the new user $user_id. Please report this error via email to support@yearaway.com. Please include the details of the new user and we will add this for you.</p><p>We apologise for the inconvience.</p>";
      }
    }

    if ( !$ok )
    {

      print "<input type=hidden name=user_id value='$user_id'>\n";
      print "<input type=hidden name=password1 value='$password1'>\n";
      print "<input type=hidden name=password2 value='$password2'>\n";
      print "<input type=hidden name=email value='$email'>\n";
      print "<input type=hidden name=forename value='$forename'>\n";
      print "<input type=hidden name=surname value='$surname'>\n";

      print "<input type=hidden name=age value=$age>\n";
      print "<input type=hidden name=gender value=$gender>\n";

      print "<input type='submit' value='Re-Enter User Details'>\n";
    }

    print "<p></p><p><a href=HomePage.php>Return to the Home Page</a>";

?>
  </td>
  </tr>
</table>
</form>
</body>
</html>

