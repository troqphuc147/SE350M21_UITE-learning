import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_instance/src/extension_instance.dart';
import 'package:get/get_navigation/src/extension_navigation.dart';
import 'package:uit_elearning/constants/text_styles.dart';
import 'package:uit_elearning/global_widgets/course_list.dart';
import 'package:uit_elearning/global_widgets/custom_icon_button.dart';
import 'package:uit_elearning/modules/lessons/controllers/lessons_controller.dart';

class LessonsScreen extends GetView<LessonsController> {
  LessonsScreen({Key? key}) : super(key: key);

  //final _controller = Get.find<LessonsController>();

  @override
  Widget build(BuildContext context) {
      Get.put(LessonsController());
      return Scaffold(
        body: Container(
          width: double.maxFinite,
          height: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ".NET advanced",
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                        ),
                      ),
                      SizedBox(height: 20,),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("10k students",
                                style: TextStyles.textStyleOnBackgroundColor14w600,
                              ),
                              SizedBox(height: 20,),
                              Row(
                                children: [
                                  Container(
                                    child: CircleAvatar(
                                      backgroundImage: const NetworkImage(
                                          'https://picsum.photos/100/100?image=35'),
                                      onBackgroundImageError: (e, s) {
                                        debugPrint('Teacher avatar can\'t load: , $e, $s');
                                      },
                                      minRadius: 15,
                                    ),
                                  ),
                                  SizedBox(width: 10,),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text("Jason Wong",
                                        style: TextStyles.textStyleOnBackgroundColor14w600,
                                      ),
                                      Text("Sr Software Engineer",
                                          style: TextStyles.textStylePrimaryColor12w300
                                      )
                                    ],
                                  )
                                ],
                              )
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(
                                children: [
                                  Text("4.8",
                                    style: TextStyles.textStyleOnBackgroundColor14w600,
                                  ),
                                  SizedBox(width: 10,),
                                  Icon(
                                    Icons.star,
                                    color: Colors.yellow,
                                  )
                                ],
                              ),
                              Text("123 reviews",
                                style: TextStyles.textStyleOnBackgroundColor14w500,
                              ),
                              SizedBox(height: 10,),
                              Text("Enroll",
                                style: TextStyles.textStyleSecondaryLightColor14w600,
                              )
                            ],
                          )
                        ],
                      ),
                      SizedBox(height: 10,),
                      Text(
                        "This class will teach you some advanced C# and .NET skill as well as a full implementation of .NET Framework for your future application.",
                        style: TextStyles.textStyleOnBackgroundColor12w400,
                      )
                    ],
                  ),
                ),
                Column(
                  children: [
                    Container(
                      child: FutureBuilder(
                        future: controller.getAllLessons(),
                        builder: (BuildContext context, snapshot) {
                          if (snapshot.hasData) {
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: controller
                                  .getAllLessons()
                                  .map<Widget>(
                                    (category) => Column(
                                  children: [
                                      CourseList(
                                      courses:
                                      controller.getAllLessons(),
                                      category: category,
                                    ),
                                    const SizedBox(
                                      height: 32,
                                    ),
                                  ],
                                ),
                              )
                                  .toList(),
                            );
                          } else if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          } else if (snapshot.hasError) {
                            return const Center(
                              child: Text('An error has occured'),
                            );
                          } else {
                            return const Center(
                              child: Text('Empty'),
                            );
                          }
                        },
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      );
    }
}
