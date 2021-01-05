```csharp
//https://www.newtonsoft.com/json/help/html/DeserializeAnonymousType.htm
            //https://stackoverflow.com/questions/6904825/deserialize-json-to-anonymous-object
            //https://makolyte.com/csharp-deserialize-json-to-dynamic-object/
            string input = @"{ ""first"": ""Foo"", ""last"": ""Bar"", ""time"":""2019-12-23T11:22:02"" }";

            dynamic myObject = JsonConvert.DeserializeObject<dynamic>(input);

            string first = Convert.ToString(myObject.first);
            string last = myObject.last;
            var time = Convert.ToDateTime(myObject.time);

            var template = new { first = String.Empty, middle = String.Empty, last = String.Empty, time=DateTime.Now };

            var output = JsonConvert.DeserializeObject(input, template.GetType());

            var ttt = JsonConvert.SerializeObject(output);

            var definition = new { Name = "" };
            string json2 = @"{'Name':'Mike'}";
            var customer2 = JsonConvert.DeserializeAnonymousType(json2, definition);

            Console.WriteLine(customer2.Name);
```