# Teamie Documentation

1. ### Dependencies
	1. Express - Express is the middleware used throughout the application. 
	2.  jade - Template engine used for home and bad HTTP requests. 
	3. mysql - Library to connect with MySQL backend. 



2. ### API

	1. **Track**
	
	   Pings tracking server with the necessary parameters stored in the body of the POST request.

	* **URL**

	  /track

	* **Method:**
	  
	  `POST`
	  
	*  **URL Params**

	   None
	   
	* **Data Params with sample input**
		```json
		{
		    "site_id": "demo.theteamie.com",
		    "user_id": 1234,
			"tracking_type": "lesson_view",  
			"entity_type": "node",  
			"entity_id": 23456,
			"group_id": 236,  
			"page_title": "Igneous Rocks | Geography MS | Teamie Demo",  
			"page_url": "https://demo.theteamie.com/dash/#/classroom/12345/sections/lesson/45678",  
			"timestamp": 1234567890000,  //This should be in milliseconds.
			"client_type": "web",  
			"client_id": "dash",  
			"client_name": "Safari",  
			"client_version": "11.0",  
			"ip_address": "12.13.14.15",  
			"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15"
		}
		```

	* **Success Response:**
	  
	  If the query does not generate a server error, the server responds with the following.

	  * **Code:** 200 <br />
	    **Content:** `{"status": "ok"}`
	 
	* **Error Response:**

	  If the server fails to execute the track request or fails to fulfill any of the the functions associated with updating the cumulative tables. The server responds with the following

	  * **Code:** 500 INTERNAL SERVER ERROR <br />
	    **Content:** `{
				    "status": "failed",
				    "error": ERROR_DATA
				}`

	* **Sample Call:**

		 ```
			curl -H "Content-type: application/json" -d '{
			        "site_id": "demo.theteamie.com",
			        "user_id": 220,
			        "tracking_type": "rag",
			        "entity_type": "node",
			        "entity_id": 23456,
			        "group_id": 234,
			        "page_title": "IgneousRocks|GeographyMS|TeamieDemo",
			        "page_url": "https://demo.theteamie.com/dash/#/classroom/12345/sections/lesson/45678",
			        "timestamp": 123456005,
			        "client_type": "web",
			        "client_id": "dash",
			        "client_name": "Safari",
			        "client_version": "11.0",
			        "ip_address": "12.13.14.15",
			        "user_agent": "Mozilla/5.0(Macintosh;IntelMacOSX10_13_6)AppleWebKit/605.1.15(KHTML,likeGecko)Version/13.0Safari/605.1.15"
			 }' '64.227.17.164:3000/track'  
			 ``` 
		
	2. **Show User**
		  Returns JSON data about a specific cumulative table. There are four tables that can be queried (Please see sample request). The method returns the entire contents of all four tables. 

		* **URL**

		  /track?table='table_name'

		* **Method:**

		  `GET`
		  
		*  **URL Params**

		   **Required:**
		 
		   `table=[string]`

		* **Data Params**

		  None

		* **Success Response:**

		  * **Code:** 200 <br />
		    **Content:** 
		   
				{
				    "status": "ok",
				    "rows": [
				        {
				            "site_id": "demo.theteamie.com",
				            "user_id": 220,
				            "group_id": 234,
				            "tracking_type": "rag",
				            "total_time": 0,
				            "last_track_id": 2
				        }
				    ]
				}
						 
		* **Error Response:**

		  * **Code:** 404 NOT FOUND <br />
		    **Content:** 
				`{
				    "status": "fail",
				    "error":  ERROR_DATA
		}`


		* **Sample Call:**

		  `curl -XGET '64.227.17.164:3000/track?table=track'`	
		  
		  `curl -XGET '64.227.17.164:3000/track?table=user_type_total'`	
		  
		  `curl -XGET '64.227.17.164:3000/track?table=user_group_entity_total'`	
		  
		  `curl -XGET '64.227.17.164:3000/track?table=user_group_type_total'`	

