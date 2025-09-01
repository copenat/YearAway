<?php
  ini_alter("session.use_cookies","1");
  session_start();

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once('../class/TextParse.class');
  include_once('../class/Log.class');
  
  $log = new Log(1);

  if ( $status==1 )
  {
     $new_status=2;
  }
  if ( $status==2 )
  {
     $new_status=1;
  }

  if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == "sue_and_nathan" )
  {
   $result = $log->get($status);
   if ($result)
   {
     $count = 1;
     while ( $row = mysql_fetch_array($result))
     {
       $var = "Error$count";
       if ( $$var == "yes"  )
       {
         #Change status to from CLOSED to OPEN or OPEN to CLOSED
         $log->set_status($row[full_timestamp],$row[title],$new_status);  
       }
       $count++;
     }
   }
  }

  include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>

<body>
<table valign="top" align="left" border="0" width=100%>
  <tr> 
    <td colspan="2">
<?php
   include ("../utils/title.php");
?>
     </td>
  </tr>


  <tr> 
    <td colspan=2 valign="top">

<?php
   print "<form name=close_entries action=\"$PHP_SELF\" method=POST>";
   print "<table border=1>";

   if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == "sue_and_nathan" )
   {
    if ( $status==1 )
    {
      print "<tr><td colspan=6><input type=submit name=Close value=\"Close selected entries\"></td></tr>";
    }else{
      print "<tr><td colspan=6><input type=submit name=Close value=\"ReOpen selected entries\"></td></tr>";
    }

    print "<input type=hidden name=status value=$status>";

    $result = $log->get($status);
    if ($result)
    {
      $count = 1;
      while ( $row = mysql_fetch_array($result))
      {
        print "<tr><td class=small><input name=\"Error$count\" value=\"yes\" type=CHECKBOX><br></td>";
        print "<td class=small>".$log->status_text($row[status])."</td><td class=small>$row[timestamp]</td><td class=small>$row[title]</td>";
        print "<td class=small>$row[description]</td><td class=small>$row[comment]</td></tr>";
        $count++;
      }
    }
   }
   else
   {
     print "<tr><td>Not logged in</td></tr>"; 
   }
?>
    </table>
    </form>
    </td>
  </tr>
</table>
</body>
</html>
