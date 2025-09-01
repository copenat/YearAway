<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once('../class/Meta.class');
  include_once('../class/TextParse.class');
  include_once('../class/DiaryEntry.class');
  include_once('../class/DiaryPhotos.class');
  include_once('../class/Trip.class');

  if (!only_alphanumeric($person))
    $person="";
  if (!only_alphanumeric($diary_name))
    $diary_name="";

  $de = new DiaryEntry($person,$diary_name,"");

  include_once('../class/Log.class');
  $log = new Log (1);
?>
<html>
<?php
  printMeta();
?>

<body>
<table align=center width="100%" border="0">
  <tr>
    <td colspan="2">

<?php
  include ("../utils/title.php");
?>

    </td>
  </tr>
</table>

<?php

    if ( $valid_user->IsValidUser() != 0 && $person != "" && $diary_name == "" && $valid_user->GetUserName() == $person )
    {
      print "<a class=new_diary_link href=\"NewDiary.php?person=$person\">I want to start a new diary?</a><br><br>\n";
    }

    $qry = "select distinct td.user_name, td.diary_name, td.description,
            date_format(min(de.start_date), '%Y%m%d') iso_sdate, 
            date_format(min(de.start_date), '%D %M %Y') start_date, 
            date_format(max(de.start_date), '%D %M %Y') end_date, 
            max(de.start_date) order_date, 
            sum(count1) no_miles,
            sum(count2) no_beds,
            count(*) no_entries
            from    trip_details td,
                    diary_entry  de,
                    country      ct
        where de.country    = ct.id 
          and td.user_name = de.user_name
          and td.diary_name = de.diary_name ";

    if ( $person != "" )
      $qry .= "and td.user_name = '$person' ";
    if ( $diary_name != "" )
      $qry .= "and td.diary_name = '$diary_name' "; 

    $qry .= "group by td.user_name, td.diary_name ";
    $qry .= " order by order_date desc " ;


    ya_connect();
    $result = mysql_query($qry);

    if (!$result)
      $log->add($PHP_SELF.":- SQL","$qry - ".mysql_error());
    else
    {
    print "<table width=100% align=center border=0>\n";
        
    $count = 0;
    while ( $row = mysql_fetch_array($result))
    {   
        if ($count > 0)
          print "<tr><td colspan=7><hr></td></tr>\n";

        $link_DS_p_dn="href='DiarySummary.php?person=$row[user_name]&diary_name=$row[diary_name]'";
        $link_DS_p="href='DiarySummary.php?person=$row[user_name]'";

        print "<tr>";
        print "<td colspan=4><span class=diary_name>Diary Name :</span><a class=diary_name_link $link_DS_p_dn>$row[diary_name]</a></td>";
        print "<td colspan=2 align=left><span class=diary_author>Diary Author : </span> <a class=diary_author_link $link_DS_p>$row[user_name]</a></td>";
#        print "<td>&nbsp</td>";

        print "<td colspan=1 rowspan=3><a class=diary_summary_link $link_DS_p_dn>Show all entry summaries<br>for $row[diary_name]</a></td></tr>\n";


        if ($row[end_date] == "" || $row[start_date] == $row[end_date] )
          print "<td colspan=4 class=diary_date>Date :$row[start_date]</td><tr>";
        else
          print "<td colspan=4 class=diary_date>Date :$row[start_date] - $row[end_date]</td><tr>\n";

        print "<td colspan=1 class=diary_entries>Number of Diary Entries : $row[no_entries]</td>";
        print "<td>&nbsp</td>";
        print "<td colspan=1 class=miles>Miles Travelled : $row[no_miles]</td>";
        print "<td>&nbsp</td>";
        print "<td colspan=1 class=beds >Beds Slept In : $row[no_beds]</td></tr>";

        print "<tr><td colspan=6><span class=diary_text_small>$row[description]</span> &nbsp; ";

        if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $row[user_name] )
        {
          print "<a class=edit_link href='NewDiary.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[iso_sdate]'>Edit diary details</a></td>\n";
        }else{
          print "</td>\n";
        }
        print "<td rowspan=2><a class=diary_summary href=\"DiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[iso_sdate]\">Show $row[diary_name]<br>page by page</a></td></tr>\n";
        print "<tr class=small><td colspan=4>&nbsp;</td></tr>"; 


        $count++;


        $de = new DiaryEntry($row[user_name], $row[diary_name],"");


        # print the countries 
        $countries = $de->get_country_count("","","",0,"");
        if (! $countries)
          $log->add($PHP_SELF.":- DiaryEntry->get_country_count","person=($person),diary_name=($diary_name) - ".mysql_error());
        else
        {
          $country_count = 0;
          while ( $country = mysql_fetch_array($countries))
          {
            if ($country_count == 0)
              print "<tr><td colspan=6><span class=visited_country_text>Countries Visited : </span>";
            else
              print ", ";
            print "<a class=visited_country_link href=\"Country.php?country=$country[country_id]\">$country[country_name]</a>";
            $country_count++;
          }
          print "</td>\n";
        }

        print "<td rowspan=2><a class=diary_summary $link_DS_p>Read all diaries<br>by $row[user_name]</a></td></tr>\n";

        print "<tr class=small><td colspan=4>&nbsp;</td></tr>"; 

        # print the latest diary_entry or summary of all
        if ( $person != "" && $diary_name != "" )
          $entries = $de->get_entries("","","","","",0,"desc");
        else
          $entries = $de->get_entries("","","","","",1,"desc");

        if ( $entries )
        {
          while ( $entry = mysql_fetch_array($entries) )
          {
            $get_vars = "person=$entry[user_name]&diary_name=$entry[diary_name]&start_date=$entry[start_date]";
            $href="DiaryEntry.php?$get_vars";

            if ( $person == "" && $diary_name == "" )
              print "<tr><td colspan=6><span class=latest_entry_text>Latest entry : </span>";
            else
            {
              print "<tr><td colspan=7><hr></td></tr>\n";
              print "<tr><td colspan=5>";
            }

            print "<a class=diary_location href=\"$href\">$entry[start_date_disp] : $entry[location] - $entry[country]</a> <span class=diary_title>$entry[section]</span></td>";

            $dph = new DiaryPhotos($entry[user_name],$entry[diary_name]);
            $dph_result = $dph->get_photo_count($entry[start_date]);
            if ($dph_result)
            {
              if ( $dph_row = mysql_fetch_array($dph_result) )
              {
                if ( $dph_row[num_of_photos] == 1 )
                {
                  print "<td>".$dph_row[num_of_photos]." photo attached</td>";
                }
                elseif ( $dph_row[num_of_photos] > 1 )
                {
                  print "<td>".$dph_row[num_of_photos]." photos attached</td>";
                } 
              }
            }
            else
              print "<td>&nbsp;</td>";

            print "<td>&nbsp;</td>";
            print "</tr>";

            print "<tr><td colspan=7 class=diary_text_small>" .  do_more($entry[message],$href);
            print "</td></tr>\n";

            if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $entry[user_name] && $person!="" )
            {
              print "<tr><td colspan=5>&nbsp</td>";
               
              print "<td><a class=edit_link href=\"EditDiaryEntry.php?$get_vars\">Edit</a></td>";
              print "<td><a class=delete_link href=\"DeleteDiaryEntry.php?$get_vars\" onclick='return window.confirm(\"Do you really wish to delete this diary entry?\")'>Delete</a><td>";

              print "</tr>\n";
              print "<tr><td colspan=5>&nbsp</td>"; 
              if ( $entry[emailsent] <= 0 )
                print "<td><a class=email_sent_link href='EmailDiaryEntry.php?$get_vars'>Send notification emails</a></td>";
              else
                print "<td><a class=email_sent_link href='EmailDiaryEntry.php?$get_vars'>Sent ".$entry[emailsent]." emails</a></td>";
              print "<td><a class=email_sent_link href='AddPhoto.php?$get_vars'>Upload Photo</a></td></tr>";

            }

          }
        }



        
    }
    print "</table>\n";

    }

?>
</table>
</body>
</html>

