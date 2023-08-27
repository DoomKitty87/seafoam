# route-gen

Instructions for generating routes:

Armadillo/gemstone routes:
Starting from the main menu (or by clicking the Generate button on the left), select the part of the crystal hollows for the route to generate in on the right side, and select using the checkboxes if you want it in the magma fields only, and if you want to ignore tp pad density (used for manual mining). Once you click next, enter the number of waypoints you want the route to be. The final output will be within 10% +/- of that number. The next screen has options to select: Tp Distance/Density is for which of the two you prefer in the final route, and will increase bias towards one or the other (Low tp distance/high density). Allowed out of bounds range has to do with the 8x8 chunk respawn areas for gemstones, and you should only change it from 0 if you are planning on timing your mining to align with the respawn times. Minimum pad separation is useful for manual mining, and should be between 5-7 if you want each pad to be a separate vein. Line of sight checking is only useful for armadillo mining (probably). It ensures that there will always be a clear path to the next tp pad from the previous one, once you've mined the gems at that pad. Approach/exit angle is also only useful for armadillo, and sets the bias towards specific approach angles for different types of veins (used to change how you will have to swipe for armadillo). Once you're done, click generate. It should take between 5 and 20 seconds to generate, depending on the settings you selected, and the route will appear in the box on the final screen.

Magma fields ruby routes:
Starting from the main menu, there are two ways to generate ruby routes. If you want only ruby in your route, start by clicking the Ruby Only checkbox on the first screen, along with magma fields (and the sector to generate in). Enter the desired waypoints, and you don't need to modify any settings on the last screen. Routes for Ruby Only may have significantly higher waypoint count than the entered value, but if you don't get one you like, trying a different sector of the hollows will usually give you a different number. If you want a ruby/topaz route, you can do it the same way you would do an armadillo/gemstone route, just with also checking the Magma fields box (do not check the Ruby Only box, or it will generate just like the other ruby method). You will also want to check Ignore Density, and on the settings page, select Tp Distance, and disable Line of Sight Checking.

Coal/Iron/Mithril routes:
Clicking the Ore Routes button on the left will take you to a one-page menu to generate ore routes, and the settings consist of waypoint count, minimum vein distance, and origin. Waypoint count is whatever you want it to be. The default value of minimum vein distance (7) is pretty good, but you will want a higher value (maybe 10 or so) for mithril, and lower if you select gemstone. (To be clear, the gemstone option is not useful, it's just there because it was easy to add.) The desired origin point selects the point where the route will try to start, though keep in mind it will begin to generate below it rather than above it if there is not a vein on the exact coordinates. This is only useful if you want a route in a unique place, but the default of 512 150 512 (the middle of the crystal nucleus) will work well for most uses. Magma fields only is useful for any mining in the magma fields (probably coal or mithril).