<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include_once('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once ('../class/DiaryEntry.class');
  include_once ('../class/DiaryPhotos.class');
  include_once("../class/Country.class");
  include_once ('../class/Trip.class');
  include_once('../class/TextParse.class'); 
  include_once('../class/Meta.class'); 
  include_once('../class/Log.class');
  $log = new Log (1);

  if (!only_alphanumeric($person))
     $person="";
  if (!only_alphanumeric($diary_name))
     $diary_name="";
  if (!valid_date($start_date))
     $start_date="";
  if (!is_numeric($start_day))
     $start_day="";
  if (!is_numeric($start_month))
     $start_month="";
  if (!is_numeric($start_year))
     $start_year="";
  if (!valid_country_id($new_country_id))
     $new_country_id="";
  $location=safeHTML($location);
  $section=safeHTML($section);
  $text=safeHTML($text);
  if (!is_numeric($count1))
     $count1="";
  if (!is_numeric($count2))
     $count2="";


  // Change so that select range of years from diary_entry and use for drop down. 
?>

<html>
<?php
  printMeta();
?>

<body>

<table width=100% border=0>
  <tr>
     <td colspan="2">

<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>
</table>

<br>

  <?php
    if ($valid_user->IsValidUser() <= 0)
    {
      print "<p>You need to login from the <a href=HomePage.php>Home Page</a> before you " .
            "can add an entry to your diary.</p><p>If you are not a registered user, " .
            "<a href=NewUser.php>please register yourself</a></p>"; 

      print "<p><a href=HomePage.php>Return to the Home Page</a></p>";

    }
    elseif($valid_user->GetUserName() != "")
    {
      $person = $valid_user->GetUserName();

      $de = new DiaryEntry($person,$diary_name,"");

      $td = new Trip($person, "");
      $result = $td->check_exists();
      if (! $result)
        $log->add($PHP_SELF.":- Trip->check_exists","person=($person),diary_name=($diary_name) - ".mysql_error());
      else
      {
         $i=0;
         while ( $xrow = mysql_fetch_array($result))
         {
           $diary_name_list[$i] = $xrow[0];
           $i++;
         }

         if ($i == 1 )
           $diary_name = $diary_name_list[0];

         if (count($diary_name_list) <= 0)
         {
           print "<p>You have to set up a new diary." .
                 "<a href=NewDiary.php?person=$person>You can do that here</a>.".
                 "<br><p><a href=HomePage.php>Return to the Home Page</a>";
         }
         else
         {
    include_once '../class/World.class';
    include_once '../class/Continent.class';



    print "<SCRIPT LANGUAGE=JavaScript>";

    $world = new World;
    $regions = $world->get_continents();
    for (reset($regions); $region = key($regions); next($regions))
    {
      print "var ${region}Array =  new Array(); \n";
      print "${region}Array[0] =  new Array( 'Select country','' ); \n";

      $continent = new Continent($region);
      $countries = $continent->get_countries();

      $count=1;
      for (reset($countries); $c = key($countries); next($countries))
      {
        print "${region}Array[$count]= new Array('$countries[$c]','$c'); \n";
        $count++;
      }
    
    }
    include '../class/CountryChooser.js';
    print "</SCRIPT>";


   $today = getdate();

   if ( $start_date != "" )
   {
     $result = $de->get_entries ("","","", $start_date, "", 1, "asc");

     if ($result)
     {
       while ( $row = mysql_fetch_array($result))
       {
          $section = $row[section];
          $location = $row[location];
          $country_id = $row[country_id];
          $country = $row[country];
          $text = $row[message];
          $count1 = $row[count1];
          $count2 = $row[count2];
       }
     }

     $sd2 = substr($start_date, 0,4);
     $sd1 = (int) substr($start_date, 4,2);
     $sd0 = (int) substr($start_date, 6,2);

   }
   elseif (  $start_year!="" && $start_month!="" && $start_day!="" )
   {
     $sd2 = $start_year;
     $sd1 = $start_month;
     $sd0 = $start_day;
   }
   else
   {
     $last_entry = $de->get_last_entry();
     if ($last_entry)
     {
      $lastrow = mysql_fetch_array($last_entry);
     }  

     $sd2 = $today['year'];
     $sd1 = $today['mon'];
     $sd0 = $today['mday'];
   }

?>

<form name=globe action="SubmitChanges.php" method="POST">
<table border=0 width=100%>
<tr>
<?php

  print "<td align=right> <b> Diary name </b> </td>";
  print "<td colspan=1>";

  if ( $diary_name == "" )
  {
    print "<select name=diary_name_num>";
    if ($last_entry)
    {
      for ($i=0; $i<count($diary_name_list); $i++)
      {
        if ( $lastrow[diary_name]==$diary_name_list[$i] ) 
          print "<option value=".($i+1)." selected >$diary_name_list[$i]\n";
        else
          print "<option value=".($i+1).">$diary_name_list[$i]\n";
      }
    }
    else
    {
      for ($i=0; $i<count($diary_name_list); $i++)
        print "<option value=".($i+1).">$diary_name_list[$i]\n";
    }
    print "</select>";
  }
  else
    print "$diary_name";
?>
  </td>
  <td>&nbsp;</td>
  <td rowspan=5 class=help_small>Hints:<br> Select a continent and then a country. This will default to the last country used.<br> You can only submit one diary for one particular day.<br> We suggest cut&pasting the text of your entry into notepad or Word until you recieve a successful submission. Just to make sure you never lose any work. </td>
</tr>

<tr>
  <td align=right> <b> Title </b> </td>
<?php
  print "<td colspan=1> <input type=text value='$section' framewidth=4 name=section size=50> </td>\n";
?>
  <td>&nbsp;</td>
</tr>

<tr>
  <td align=right> <b> Start Date </b> </td>

<td colspan=1>
<select name=start_day> 
<?php
    for ($i=1; $i<32; $i++)
    { 
      if ($sd0 == $i) 
        print "<option value=$i selected>$i\n";
      else
        print "<option value=$i>$i\n";
    }
    
?>
</select>

<select name=start_month>
<?php
    for ($i=1;$i<=12;$i++)
    {
       if ($i == $sd1)
         print "<option value=$i selected>".mm2mmm($i);
       else
         print "<option value=$i >".mm2mmm($i);
    }
?>
</select>

<select name=start_year> 
<?php
# needs changing here!!!!
# Simply earliest year in table ---> today+1

    $years = array($today['year']+1,$today['year'],$today['year']-1,$today['year']-2,$today['year']-3,$today['year']-4);
    foreach ($years as $year)
    {
      if ($year == $sd2)
        print "<option value=$year selected>$year\n";
      else
        print "<option value=$year>$year\n";
    }
?>
</select>
</td>
<td>&nbsp;</td>

<?php
  print "<INPUT type=hidden name=person value=$person>";
  print "<INPUT type=hidden name=diary_name value=$diary_name> <INPUT type=hidden name=start_date value=$start_date>";
?>

</tr>

<tr>
   <td align=right> <b>Continent & Country </b></td> 
   <td>
<?php
    print "<select name=region onChange=\"populateCountry(document.globe, document.globe.region.options[document.globe.region.selectedIndex].value)\">";

    if ( $new_country_id != "" )
    {
       $cty = new Country( $new_country_id );
       $cont = new Continent( $cty->get_continent() );
       print "<option value=''>Select Region</option>\n";
    }
    elseif ( $country_id != "" )
    {
       #Already have country_id and country from above
       $cty = new Country( $country_id );
       $cont = new Continent( $cty->get_continent() );
       print "<option value=''>Select Region</option>\n";
    }
    elseif ( $lastrow[country_id] != "" )
    {
       #Got country from previous entry - better than nothing I guess!
       $cty = new Country( $lastrow[country_id] );
       $cont = new Continent( $cty->get_continent() );
       print "<option value=''>Select Region</option>\n";
    }
    else
       print "<option selected value=''>Select Region</option>\n";

    $world = new World();
    $regions = $world->get_continents();
    for (reset($regions); $region = key($regions); next($regions))
    {
      if ( $new_country_id != "" && $cty->get_continent() == $region )
        print "<option selected value='$region'>$regions[$region]</option>\n";
      elseif ( $country_id != "" && $cty->get_continent() == $region )
        print "<option selected value='$region'>$regions[$region]</option>\n";
      elseif ( $lastrow[country_id] != "" && $cty->get_continent() == $region )
        print "<option selected value='$region'>$regions[$region]</option>\n";
      else
        print "<option value='$region'>$regions[$region]</option>\n";
    }
    print "</select>\n";


#    print "<select name=country_id onChange=\"setCountryToDefault(document.globe)\">";
    print "<select name=new_country_id>";

    if ( $new_country_id != "" || $country_id != "" || $lastrow[country_id] != "" )
    {
      $countries = $cont->get_countries();
      $count=1;
      for (reset($countries); $c = key($countries); next($countries))
      {
        if ( $c == $new_country_id || $c == $country_id || $c == $lastrow[country_id] )
           print "<option selected value=$c>".$countries[$c];
        else
           print "<option value=$c>".$countries[$c];
        $count++;
      }
    }
    else
       print "<option value=''><--------------------\n";

    print "</select>\n";

?>
  </td>
   <td>&nbsp;</td>
</tr>

<tr>
  <td align=right> <b> Place </b> </td>
<?php
  print "<td colspan=1> <INPUT type=text value='$location' framewidth=4 name=location size=30> </td>\n";
?>
  <td>&nbsp;</td>
</tr>

<tr>
            <td align=right NOWRAP><b>Miles covered since last entry:</b></td>
<?php
  print "<td colspan=1> <input type=text name=count1 size=6 value=$count1> </td>\n";
?>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
</tr>




<tr>
            <td align=right NOWRAP><b>Beds slept in since last entry:</b></td>
<?php
  print "<td colspan=1> <input type=text name=count2 size=6 value=$count2> </td>\n";
?>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
</tr>
<tr>
</tr>
<tr>
  <td colspan=4 align=center> <textarea name=text wrap=virtual cols=120 rows=15>
<?php
    print "$text";
?>
  </textarea> </td>
</tr>
<tr> <td colspan=4 align=center>
<INPUT TYPE="submit" value="Press to Update Diary">&nbsp &nbsp &nbsp<INPUT TYPE="reset" value="Press to Reset Fields">
</td></tr>

</table>
</form>
<?php
        }
     }
    }
?>

</body>
</html>
