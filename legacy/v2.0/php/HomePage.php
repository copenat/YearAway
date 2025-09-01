<?php
  ini_alter("session.use_cookies","1");
  ini_alter("session.use_only_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");
  if ($logout == 1)
  {
    session_destroy();
    $valid_user->LogOut();
  }
   
  include_once('../class/Meta.class');
  include_once('../class/TextParse.class');
  include_once('../class/DiaryEntry.class');
  include_once('../class/DiaryPhotos.class');
  include_once('../class/Trip.class');

  $de = new DiaryEntry("","","");

  if (!is_numeric($l))
     $l=10;
  if (!is_numeric($a))
     $a=0;


  include_once('../class/Log.class');
  $log = new Log (1);
?>

<html>
<?php
  printMeta();
?>

<body>

<table width="100%" align="left" border="0" valign="top">
  <tr>
     <td colspan="2" valign="top">
<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>

  <tr> 
    <td valign="top" width="122"> 

<?php

    if ( $valid_user->IsValidUser() != 0 )
    {
      print "<form action=\"$PHP_SELF?logout=1\" method=post>";
      print "<table border=0 class=login_text> <tr>";

      print "<tr><td></td></tr>\n";
      print "<tr><td>$valid_user->forename, you are currently logged in.</td></tr>\n";
      print "<td align=center><input type=submit value=\"LogOut\" name=\"submit\"></td></tr>";
    }
    else
    {
      print "<form action=\"Login.php?" . SID . "\" method=post>";
      print "<table border=0 class=login_text> <tr>";

      print " <td>".
            "  Login to add diary entries and photos :
            </td></tr>".

            "<tr><td NOWRAP>Username<input type=\"text\" name=\"form_userid\" value=\"\" size=\"15\"></td></tr>".
            "<tr><td NOWRAP>Password<input type=\"password\" name=\"form_passwd\" value=\"\" size=\"15\"></td></tr>".
            "<td align=center>".
            "<input type=\"hidden\" name=\"logging_in\" value=\"yes\">".
            "<input type=submit value=\"Login\" name=\"submit\"></td></tr>";

       print "<tr><td>&nbsp;</td></tr>\n";
       print "<tr><td><a href=NewUser.php>Register as a new user </a>and add diaries and photos. Keep friends and family updated by using email facility.</a></td></tr>\n";
       print "<tr><td></td></tr>\n";
    }
 
?>
       </table>
     </form>
     
<?php
    if ($valid_user->IsValidUser() != 0 && $valid_user->GetUserName() == "sue_and_nathan")
    {
      print "<a href=DisplayErrorLog.php?status=1>View Open Logs.</a><br>";
      print "<a href=DisplayErrorLog.php?status=2>View Closed Logs.</a><br>";
    }
?>

<?php
  include "../utils/countries.php";  
?>

     <span class=small><p>Please contact us at support@yearaway.com with any problems or suggestions</p></span>
    </td>


    <td valign=top align=center> 

<?php
    $feature_user="";
    $feature_diary="";
    $feature_date="";

    
    $feature_dph = new DiaryPhotos("","");
    $result = $feature_dph->get_special_feature_photo(1);
    if ($result)
    {
      if ($row = mysql_fetch_array($result))
      {
         $feature_user = $row[user_name];
         $feature_diary = $row[diary_name];
         $feature_dph->set_person($feature_user);
         $feature_dph->set_diary_name($feature_diary);

         $feature_date = $row[start_date];
 
         $full_filename = $feature_dph->get_full_filename($row[filename], $feature_dph->get_type($feature_date,$row[filename]));
         list($w,$h) = explode(" ", $feature_dph->resize_photo("medium", $full_filename)) ;
         $feature_photo = "<table class=diary_text_small><tr><td><a class=visited_country_link target=\"YearAway $feature_user photos\" href=\"Photo.php?person=$feature_user&diary_name=$feature_diary&start_date=$feature_date&fn=$row[filename]\"><img width=$w height=$h src=\"$full_filename\" border=0 ></a></td></tr><tr><td align=center>$row[comment]</td></tr></table>";
       }
    }

    $feature_de = new DiaryEntry($feature_user,$feature_diary,"");
    $result = $feature_de->get_entries("","","",$feature_date,"",1,"desc");
    if ( $row = mysql_fetch_array($result))
    {
      $href = "DiaryEntry.php?person=$feature_user&diary_name=$feature_diary&start_date=$feature_date";
      $feature_message = do_more($row[message], $href);
      $feature_title = $row[section];
      $feature_location = $row[location];
      $feature_country = $row[country];
      $feature_date_disp = $row[start_date_disp];
      $feature_user_href="DiarySummary.php?person=$feature_user";
      $feature_diary_href="DiarySummary.php?person=$feature_user&diary_name=$feature_diary";
    }


    print "<table border=\"0\"><tr><td valign=top>";
    print $feature_photo."</td><td valign=top >"; 

    print "<table valign=top border=\"0\">";
    print "<tr><td><span class=diary_title>$feature_title</span> by <a class=diary_author_link href='$feature_user_href'>$feature_user</a> in diary <a class=diary_name_link href='$feature_diary_href'>$feature_diary</a></td></tr>";
    print "<tr><td>$feature_message</td></tr>";
    print "</table>";

    print "</td></tr></table>";


?>
      <table border="0" align=left>
        <tr><td>&nbsp</td></tr>
        <tr>
          <td>

            <table align=left border=0 class=latest_entry_text>
               <tr>
                 <td colspan="6">
<?php

   if ( $l == 10 )
   {
     print "<a class=de_menu_options_curr>Latest 10 diary entries</a>|";
     print "<a href=\"HomePage.php?l=0\" class=de_menu_options>List all diary entries</a>|";
 
     if ( $a == 0 )
       print "<a href=\"HomePage.php?l=10&a=1\" class=de_menu_options>Order by Author</a>";
     else
       print "<a href=\"HomePage.php?l=10&a=0\" class=de_menu_options>Order by Date</a>";
   }

   if ( $l == 0 )
   {
     print "<a href=\"HomePage.php?l=10\" class=de_menu_options>Latest 10 diary entries</a>|";
     print "<a class=de_menu_options_curr>List all diary entries</a>|";

     if ( $a == 0 )
       print "<a href=\"HomePage.php?l=0&a=1\" class=de_menu_options>Order by Author</a>";
     else
       print "<a href=\"HomePage.php?l=0&a=0\" class=de_menu_options>Order by Date</a>";

   }


?>
                 </td>
               </tr>
               <tr></tr>

<?php

  if ( $a==1 )
    $result = $de->get_entries("","","","","",$l," d.user_name,d.diary_name asc ");
  else
    $result = $de->get_entries("","","","","",$l,"desc");

  if ( !$result )
    $log->add($PHP_SELF.":- DiaryEntry->get_entries","person=($person),diary_name=($diary_name) - ".mysql_error());
  else
  {
     while ($row = mysql_fetch_array($result))
     {
        $link = "<a class=latest_entry_link href=\"".
                "DiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]\">";

        $photo_num = 0;
        $dph = new DiaryPhotos($row[user_name], $row[diary_name]);

        $ph_res = $dph->get_photo_count($row[start_date]);
        if ( $ph_res )
        {
          if ( $photo = mysql_fetch_array($ph_res) )
            $photo_num = $photo[num_of_photos];
        }

        print "<tr>";
        if ( $photo_num > 0 )
          print "<td NOWRAP>$link<img border=0 width=18  src=\"../graphics/camera.gif\"></a></td>";
        else
          print "<td></td>";
        print "<td NOWRAP>$link$row[start_date_disp]</a></td>";
        print "<td>$link<b>$row[country]</b><wbr> : $row[location]</a></td>";
        print "<td NOWRAP>$link$row[section]</a></td>";
#        print "<td NOWRAP>$link$row[diary_name]</a></td>";
        print "<td NOWRAP>by $link$row[user_name]</a></td>";
        print "</tr>";

    }

  }

?>

            </table>

         </td>
 
         <td>
         </td>
       </tr>
     </table>

    </td>

  </tr>
</table>
</body>
</html>




