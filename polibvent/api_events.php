<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $query = "SELECT * FROM events WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($event);
        } else {
            $query = "SELECT * FROM events ORDER BY start_date DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($events);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Handle base64 image data - save to file or store as text
        $poster_url = $data['poster_url'];
        
        // If it's a base64 image, save it to file
        if (strpos($poster_url, 'data:image') === 0) {
            $poster_url = saveBase64Image($poster_url);
        }
        
        $query = "INSERT INTO events (title, description, start_date, end_date, start_time, end_time, location, poster_url, status, approval_status, created_by) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        $result = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['start_date'],
            $data['end_date'],
            $data['start_time'],
            $data['end_time'],
            $data['location'],
            $poster_url,
            $data['status'],
            $data['approval_status'],
            $data['created_by']
        ]);
        
        echo json_encode(["success" => $result, "id" => $db->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Handle base64 image data
        $poster_url = $data['poster_url'];
        if (strpos($poster_url, 'data:image') === 0) {
            $poster_url = saveBase64Image($poster_url);
        }
        
        $query = "UPDATE events SET title=?, description=?, start_date=?, end_date=?, start_time=?, end_time=?, location=?, poster_url=?, status=?, approval_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?";
        $stmt = $db->prepare($query);
        
        $result = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['start_date'],
            $data['end_date'],
            $data['start_time'],
            $data['end_time'],
            $data['location'],
            $poster_url,
            $data['status'],
            $data['approval_status'],
            $data['id']
        ]);
        
        echo json_encode(["success" => $result]);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "DELETE FROM events WHERE id = ?";
        $stmt = $db->prepare($query);
        $result = $stmt->execute([$data['id']]);
        
        echo json_encode(["success" => $result]);
        break;
}

// Function to save base64 image to file
function saveBase64Image($base64_string) {
    $upload_dir = "uploads/posters/";
    
    // Create directory if not exists
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Generate unique filename
    $filename = uniqid() . '.png';
    $file_path = $upload_dir . $filename;
    
    // Extract base64 data
    $base64_data = explode(',', $base64_string);
    $image_data = base64_decode($base64_data[1]);
    
    // Save file
    if (file_put_contents($file_path, $image_data)) {
        return $file_path;
    }
    
    return "uploads/posters/default.jpg"; // Fallback
}
?>