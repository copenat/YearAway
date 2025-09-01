<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");
   if ($logout == 1)
   {
     session_destroy();
     $valid_user->LogOut();
   }

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_date($start_date))
     $start_date="";

   include_once("../class/Hit.class");
   $hit = new Hit($person, $diary_name, $start_date);

   include_once('../class/DiaryEntry.class');
   $de = new DiaryEntry($person,$diary_name,"");

   include_once('../class/DiaryPhotos.class');
   $dph = new DiaryPhotos($person,$diary_name);

   include_once('../class/Log.class');
   $log = new Log (1);
   
   include_once('../class/Meta.class');


   if ($person!="" && $diary_name!="" && $start_date !="")
   {

     $prev_result = $de->get_previous_entries($start_date, 1);
     if ( !$prev_result )
       $log->add($PHP_SELF.":- DiaryEntry->get_previous_entries","start_date:($start_date),person=($person),diary_name=($diary_name) - ".mysql_error());
     else
       $prev = mysql_fetch_array($prev_result);


     $next_result = $de->get_next_entries($start_date, 1);
     if ( !$next_result )
       $log->add($PHP_SELF.":- DiaryEntry->get_next_entries","start_date:($start_date),person=($person),diary_name=($diary_name) - ".mysql_error());
     else
       $next = mysql_fetch_array($next_result);
   }
?>
<html>
<?php
   printMeta();
?>

<body>
<table width=100% align="left" border="0">
  <tr> 
    <td colspan="2">
<?php
  include "../utils/title.php";
?>
    </td>
  </tr>


  <tr> 
    <td width=20% valign=top> 
<?php

    if ( $valid_user->IsValidUser() != 0 )
    {
      print "<form action=\"$PHP_SELF?logout=1\" method=post>";
      print "<table border=0 class=login_text> <tr>";

      print "<tr><td></td></tr>\n";
      print "<tr><td>$valid_user->forename, you are currently logged in.</td></tr>\n";
      print "<td align=center><input type=submit value=\"LogOut\" name=\"submit\"></td></tr>";
      print "<input type=hidden name=person value=$person>
             <input type=hidden name=diary_name value=$diary_name>
             <input type=hidden name=start_date value=$start_date>";
      print "</table></form><br>";
    }

    print "<form action=\"SubmitSubscribe.php?" . SID . "\" method=post>";
    print "<table border=0> <tr><td class=subscribe_text>";
    print "Enter your email to subscribe to diaries by $person.";
    print "<input type=hidden name=person value=$person>
           <input type=hidden name=diary_name value=$diary_name>
           <input type=hidden name=start_date value=$start_date>";
?> 
     </td></tr>
     <tr><td> 
      <input type=text framewidth=4 name=subscribe_email size=24>
     </td>
     </tr>
     <tr>
     <td>
      <input type=submit name=submit value='Subscribe'>
     </td></tr>
     </table> 

<?php
   print "</form>";
   print "<table border=0 valign=top>";


   if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $person )
   {
      print "<tr><td><a class=visited_country_link href=\"AddPhoto.php?person=$person&diary_name=$diary_name&start_date=$start_date\">Upload Photo</a></td></tr>";
      print "<tr><td><a class=visited_country_link href=\"EditPhoto.php?person=$person&diary_name=$diary_name&start_date=$start_date\">Edit Photos</a></td></tr>";
   }

   # Get the number of photos and the individual names

   $result = $dph->get_photo_count($start_date);
   if ($result)
   {
     if ( $row = mysql_fetch_array($result) )
     { 
       if ( $row[num_of_photos] > 0 )
       {
         $num_of_photos = $row[num_of_photos];

         $result = $dph->get_photo($start_date,0);
         if ($result)
         {
           if ($row = mysql_fetch_array($result))
           {
             $full_filename = $dph->get_full_filename($row[filename], $dph->get_type($start_date,$row[filename]));
             list($w,$h) = explode(" ", $dph->resize_photo("small", $full_filename)) ;
             print "<tr><td><a class=visited_country_link target=\"YearAway $person photos\" href=\"Photo.php?person=$person&diary_name=$diary_name&start_date=$start_date&fn=$row[filename]\"><img width=$w height=$h src=\"$full_filename\" border=0 ></a></td></tr>";
             print "<tr><td><a class=visited_country_link target=\"YearAway $person photos\" href=\"Photo.php?person=$person&diary_name=$diary_name&start_date=$start_date&fn=$row[filename]\">See all photos($num_of_photos)</a></td></tr>";
           }
         }
       }
     }
   }



   # Add the countries visited in the diary

   print " <tr> <td class=visited_country_text>Other countries $person<br>visited in $diary_name</td> </tr> ";
   $result = $de->get_country_count("","","",0,"");

   if ( !$result )
      $log->add($PHP_SELF.":- DiaryEntry->get_country_count","person=($person),diary_name=($diary_name) - ".mysql_error());
   else
   {
    while ( $row = mysql_fetch_array($result))
        print "<tr><td><a class=visited_country_link href=\"Country.php?country=$row[country_id]\">$row[country_name] ($row[total])</a></td></tr>\n";
   }
?>
    </table>
    </td>


    <td align=left valign="top"> 
       <table width=100% border="0" align="left" valign="top">
         <tr><td colspan=4>

<?php

 if ($person!="" && $diary_name!="" && $start_date !="")
 {

    print "<table width=100% border=0>";
    $result = $de->get_entries ("","", "", "","", 0, ""); 
    if (! $result)
       $log->add($PHP_SELF.":- DiaryEntry->get_entries all","start_date=($start_date),person=($person),diary_name=($diary_name) - ".mysql_error());
    else
    {
       $count = 1;
       while ( $row = mysql_fetch_array($result))
       {
          $href="DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$row[start_date]";
          if ($count==1)
          {
             print "<tr><td>Diary <a class=diary_name_link href='DiarySummary.php?person=$person&diary_name=$diary_name''>$diary_name</a> : ";
          }
          if ( $row[start_date] == $start_date )
          {
             print "<a class=photo_num_curr href=\"$href\">$count</a> ";  
          }else{
             print "<a class=photo_num href=\"$href\">$count</a> ";
          }
          $count++;
       }
       if ( $count > 1 )
       {
          if ( $prev )
          {
            print "<a class=diary_prev_link href=\"DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$prev[start_date]\">previous</a> ";
          }
          if ( $next )
          {
            print "<a class=diary_next_link href=\"DiaryEntry.php?person=$person&diary_name=$diary_name&country=$next[country_id]&start_date=$next[start_date]\">next</a>";
          }

          print "</td></tr>";
       }
    }
    print "</table>";

    print "<table width=100% border=0>";
    $result = $de->get_entries ("","", "", $start_date,"", 1, "desc");

    if (! $result)
        $log->add($PHP_SELF.":- DiaryEntry->get_entries","start_date=($start_date),person=($person),diary_name=($diary_name) - ".mysql_error());
    else
    {
        while ( $row = mysql_fetch_array($result))
        {
            print "<tr>";
            print "<td colspan=2 align=left><span class=diary_date>$row[start_date_disp]</span> : <span class=diary_location>$row[location]</span> - <span class=diary_country>$row[country]</td></span>";

            if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $row[user_name] )
            {
             print "<td><a class=edit_link href=\"EditDiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]\">Edit</a></td>";
            }
            else
             print "<td>&nbsp</td>";

            print "<td align=right><a class=printerfriendly_link href='PrinterFriendlyDiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]'>Printer friendly version</a></td>";
            print "</tr>";

            # Add 'Edit' if user is logged in and owns this diary
            if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $row[user_name] )
            {
              print "<tr><td colspan=2>&nbsp;</td>";
              print "<td><a class=delete_link href=\"DeleteDiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]\" onclick='return window.confirm(\"Do you really wish to delete this diary entry?\")'>Delete</a></td>";
              if ( $row[emailsent] <= 0 )
                print "<td align=right><a class=email_sent_link href='EmailDiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]'>Send notification emails</a></td>";
              else
                print "<td align=right><a class=email_sent_link href='EmailDiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]'>Sent ".$row[emailsent]." emails</a></td>";
              print "</tr>";
            }

            if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $row[user_name] )
            { 
              print "<tr><td colspan=2>&nbsp;</td>";
              print "<td colspan=2 class=diary_read align=left>Entry has been read ".$hit->get_count()." times</td>";
              print "</tr>";
            }



            print "<tr><td colspan=4><span class=diary_title>$row[section]</span> by <a class=diary_author_link href='DiarySummary.php?person=$person''>$row[user_name]</a> in diary <a class=diary_name_link href='DiarySummary.php?person=$person&diary_name=$diary_name''>$row[diary_name]</a></td></tr>";

            print "</table>";

            print "</td></tr>";


            print "<tr><td colspan=4 class=diary_text>".http2ahref(nl2br($row[message]))."</td></tr>";

            $count++;
        }



        print "<tr><td colspan=4>&nbsp;</td><tr>";
        print "<td colspan=2 align=center>";
        if ( $prev )
          print "<a class=diary_prev_link href=\"DiaryEntry.php?person=$person&diary_name=$diary_name&country=$prev[country_id]&start_date=$prev[start_date]\">Previous Entry:</a>";
        else
          print "<span class=diary_prev_link>Previous Entry:</span>";
        print "</td>";


        print "<td colspan=2 align=center>";
        if ( $next )
          print "<a class=diary_next_link href=\"DiaryEntry.php?person=$person&diary_name=$diary_name&country=$next[country_id]&start_date=$next[start_date]\">Next Entry:</a>";
        else
          print "<span class=diary_prev_link>Next Entry:</span>";
        print "</td>";
        print "</tr>";



        print "<tr><td colspan=2 align=center class=diary_prev_desc width=50%>";
        if ( $prev )
          print $prev[start_date_disp]." : ".$prev[location]." - ".$prev[country];

        print "</td>";

        print "<td colspan=2 align=center class=diary_next_desc width=50%>";
        if ( $next )
          print $next[start_date_disp]." : ".$next[location]." - ".$next[country];
      
        print "</td></tr>";


        print "<tr><td colspan=2 align=center class=diary_prev_title width=50%>";
        if ( $prev )
          print $prev[section];
      
        print "</td>";

        print "<td  colspan=2 align=center class=diary_next_title width=50%>";
        if ( $next )
          print $next[section];

        print "</td></tr>";
    }
 }
?>
   
       
       </table>

     </td>
  </tr>
</table>
</body>
</html>
