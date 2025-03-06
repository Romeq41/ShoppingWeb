<?php
class Report
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getReports(): void
    {
        $stmt = $this->pdo->query("SELECT * FROM reports");
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($reports) {
            http_response_code(200);
            echo json_encode($reports);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'No reports found']);
        }
    }

    public function getReport($id): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM reports WHERE reportID = ?");
        $stmt->execute([$id]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($report) {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE userID = ?");
            $stmt->execute([$report['userID']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $report['user'] = $user;

            http_response_code(200);
            echo json_encode($report);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Report not found']);
        }
    }

    public function createReport(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $stmt = $this->pdo->prepare("INSERT INTO reports (name, email, subject, report_data) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $data['subject'], $data['report_data']]);

        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Report created']);
    }

    public function updateReport($id): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['name'],$data['email'],$data['subject'], $data['report_data'])) {
            $stmt = $this->pdo->prepare("UPDATE reports SET name = ?, email = ?,subject = ?, report_data = ? WHERE reportID = ?");
            $stmt->execute([$data['name'],$data['email'],$data['subject'], $data['report_data'], $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Report updated']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function deleteReport($id): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM reports WHERE reportID = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Report deleted']);
    }

}